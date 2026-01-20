import { useState, useEffect, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { logger } from "../lib/logger.server";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  DropZone,
  Thumbnail,
  InlineError,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ProductInfo {
  id: string;
  title: string;
  handle: string;
  price: string;
  image?: string;
  description?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  // Fetch products for recommendations
  const response = await admin.graphql(`
    #graphql
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            featuredImage {
              url
            }
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
          }
        }
      }
    }
  `, {
    variables: { first: 50 }
  });

  const responseJson = await response.json();
  const responseData = responseJson.data as any;
  const products = responseData?.products?.edges?.map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    handle: edge.node.handle,
    description: edge.node.description,
    image: edge.node.featuredImage?.url,
    price: edge.node.variants.edges[0]?.node.price || "0.00"
  })) || [];

  return json({ products });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const userMessage = formData.get("message") as string;
  const imageData = formData.get("image") as string;

  if (!userMessage && !imageData) {
    return json({ error: "Message or image is required" }, { status: 400 });
  }

  try {
    // Get products for context
    const response = await admin.graphql(`
      #graphql
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
            }
          }
        }
      }
    `, {
      variables: { first: 50 }
    });

    const responseJson = await response.json();
    const responseData = responseJson.data as any;
    const products = responseData?.products?.edges?.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.description,
      image: edge.node.featuredImage?.url,
      price: edge.node.variants.edges[0]?.node.price || "0.00"
    })) || [];

    // If image is provided, analyze it
    if (imageData) {
      try {
        const analyzeResponse = await fetch('https://dermi.vercel.app/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shop: 'admin-interface',
            sessionId: Date.now().toString(),
            image: imageData,
            fileName: 'uploaded-image.jpg'
          })
        });

        const result = await analyzeResponse.json();
        const analysisMessage = result.analysis || result.response || 'Image analyzed successfully.';

        return json({
          response: analysisMessage,
          recommendations: result.recommendations || [],
          confidence: result.confidence || 0.7,
          imageAnalysis: true
        });
      } catch (error) {
        logger.error("Error analyzing image:", error);
        return json({ error: "Failed to analyze image" }, { status: 500 });
      }
    }

    // Process text message through N8N service
    const { n8nService } = await import("../services/n8n.service.server");
    const n8nResponse = await n8nService.processUserMessage({
      userMessage,
      products,
      context: {
        previousMessages: []
      }
    });

    return json({
      response: n8nResponse.message,
      recommendations: n8nResponse.recommendations || [],
      confidence: n8nResponse.confidence || 0.7
    });
  } catch (error) {
    logger.error("Error processing message:", error);
    return json({ error: "Failed to process message" }, { status: 500 });
  }
};

export default function SalesAssistantSimple() {
  useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI sales assistant. I can help you find products, answer questions about pricing, shipping, and provide personalized recommendations. Upload an image or type a message to get started!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [recommendations, setRecommendations] = useState<ProductInfo[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");

  // Inject keyframes once
  useEffect(() => {
    if (!document.getElementById('loading-bounce-keyframes')) {
      const style = document.createElement('style');
      style.id = 'loading-bounce-keyframes';
      style.textContent = '@keyframes loadingBounce{0%,60%,100%{transform:translateY(0) scale(1);opacity:.7}30%{transform:translateY(-10px) scale(1.2);opacity:1}}';
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (fetcher.data && 'response' in fetcher.data) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: fetcher.data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);

      if (fetcher.data.recommendations) {
        setRecommendations(fetcher.data.recommendations);
      }

      // Clear upload after processing
      setUploadedFile(null);
      setImagePreview("");
    }
  }, [fetcher.data]);

  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      setFileError("");

      if (acceptedFiles.length === 0) {
        setFileError("Please upload a valid image file (PNG, JPG, GIF, or WebP)");
        return;
      }

      const file = acceptedFiles[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File size must be less than 5MB");
        return;
      }

      setUploadedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleSendMessage = async () => {
    // Handle image upload
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const base64Image = e.target.result as string;

          const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: `[Uploaded image: ${uploadedFile.name}]`,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, userMessage]);

          fetcher.submit(
            { message: "", image: base64Image },
            { method: "POST" }
          );
        }
      };
      reader.readAsDataURL(uploadedFile);
      return;
    }

    // Handle text message
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    fetcher.submit(
      { message: inputMessage },
      { method: "POST" }
    );

    setInputMessage("");
  };

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setImagePreview("");
    setFileError("");
  }, []);

  return (
    <Page>
      <TitleBar title="AI Sales Assistant" />
      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Product Recommendations
              </Text>
              {recommendations.length > 0 ? (
                <BlockStack gap="300">
                  {recommendations.map((product) => (
                    <Card key={product.id} padding="300">
                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3">{product.title}</Text>
                        <Badge tone="success">{`$${product.price}`}</Badge>
                        {product.description && (
                          <Text variant="bodySm" as="p" tone="subdued">
                            {product.description.substring(0, 100)}...
                          </Text>
                        )}
                      </BlockStack>
                    </Card>
                  ))}
                </BlockStack>
              ) : (
                <Text variant="bodyMd" as="p" tone="subdued">
                  Ask me for product recommendations to see suggestions here.
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="fullWidth">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Chat with AI Sales Representative
              </Text>
              
              <div style={{ 
                height: "400px", 
                overflowY: "auto", 
                border: "1px solid #e1e3e5", 
                borderRadius: "8px", 
                padding: "16px",
                backgroundColor: "#fafbfb"
              }}>
                <BlockStack gap="300">
                  {messages.map((message) => (
                    <div key={message.id} style={{
                      display: "flex",
                      justifyContent: message.role === "user" ? "flex-end" : "flex-start"
                    }}>
                      <div style={{ 
                        maxWidth: "70%", 
                        padding: "12px", 
                        borderRadius: "8px",
                        backgroundColor: message.role === "user" ? "#006fbb" : "#ffffff",
                        color: message.role === "user" ? "white" : "black",
                        border: message.role === "assistant" ? "1px solid #e1e3e5" : "none"
                      }}>
                        <Text variant="bodyMd" as="p">
                          {message.content}
                        </Text>
                      </div>
                    </div>
                  ))}
                  {fetcher.state === "submitting" && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e1e3e5",
                        display: "flex",
                        gap: "6px",
                        alignItems: "center"
                      }}>
                        <div style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: "#006fbb",
                          animation: "loadingBounce 1.4s ease-in-out infinite",
                          animationDelay: "0s"
                        }} />
                        <div style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: "#006fbb",
                          animation: "loadingBounce 1.4s ease-in-out infinite",
                          animationDelay: "0.2s"
                        }} />
                        <div style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: "#006fbb",
                          animation: "loadingBounce 1.4s ease-in-out infinite",
                          animationDelay: "0.4s"
                        }} />
                      </div>
                    </div>
                  )}
                </BlockStack>
              </div>

              <BlockStack gap="300">
                {/* File Upload Section */}
                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p" fontWeight="semibold">
                    Upload an Image (Optional)
                  </Text>
                  {!uploadedFile ? (
                    <DropZone
                      accept="image/*"
                      type="image"
                      onDrop={handleDropZoneDrop}
                      allowMultiple={false}
                    >
                      <DropZone.FileUpload
                        actionTitle="Upload image"
                        actionHint="or drop image to upload"
                      />
                    </DropZone>
                  ) : (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      border: "1px solid #e1e3e5",
                      borderRadius: "8px",
                      backgroundColor: "#fafbfb"
                    }}>
                      {imagePreview && (
                        <Thumbnail
                          source={imagePreview}
                          alt={uploadedFile.name}
                          size="large"
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <Text variant="bodyMd" as="p" fontWeight="semibold">
                          {uploadedFile.name}
                        </Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </Text>
                      </div>
                      <Button
                        variant="plain"
                        onClick={handleRemoveFile}
                        tone="critical"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {fileError && <InlineError message={fileError} fieldID="file-upload" />}
                </BlockStack>

                {/* Text Input Section */}
                <InlineStack gap="200" align="end">
                  <div style={{ flex: 1 }}>
                    <TextField
                      label=""
                      value={inputMessage}
                      onChange={setInputMessage}
                      placeholder="Ask me about products, pricing, shipping, or upload an image..."
                      autoComplete="off"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                    disabled={(!inputMessage.trim() && !uploadedFile) || fetcher.state === "submitting"}
                  >
                    {uploadedFile ? "Analyze Image" : "Send"}
                  </Button>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 