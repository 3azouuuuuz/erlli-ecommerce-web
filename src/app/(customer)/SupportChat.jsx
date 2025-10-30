import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { IoSend, IoCheckmark, IoCheckmarkCircle } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import axios from 'axios';
import ProfileHeader from '../../components/ProfileHeader';
import juliaLogo2 from '../../assets/images/julialogo2.png';
import juliaBlack from '../../assets/images/juliablack.png';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: white;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 2px solid #E4E4E74D;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CircleContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  box-shadow: 0 8px 24px rgba(0, 188, 125, 0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 2px solid #00BC7D;
    opacity: 0.3;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 0; }
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    
    &::before {
      width: 70px;
      height: 70px;
    }
  }
`;

const InnerCircle = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const HeaderIcon = styled.img`
  width: 56px;
  height: 56px;
  
  @media (max-width: 768px) {
    width: 42px;
    height: 42px;
  }
`;

const HeaderImage = styled.img`
  height: 50px;
  object-fit: contain;
  
  @media (max-width: 768px) {
    height: 40px;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fafbfc;
  min-height: calc(100vh - 200px);
  
  @media (max-width: 768px) {
    padding: 20px 16px;
    gap: 16px;
    min-height: calc(100vh - 180px);
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: ${props => props.$isUser ? 'row-reverse' : 'row'};
  align-items: flex-end;
  gap: 12px;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  max-width: 65%;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 1024px) {
    max-width: 75%;
  }
  
  @media (max-width: 768px) {
    max-width: 85%;
  }
`;

const Message = styled.div`
  padding: 16px 20px;
  border-radius: ${props => props.$isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px'};
  background: ${props => props.$isUser 
    ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' 
    : 'linear-gradient(135deg, #D0FAE5 0%, #B8F5D8 100%)'};
  border: ${props => props.$isUser ? '2px solid #00BC7D' : 'none'};
  color: #000000;
  font-family: 'Raleway', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 14px;
  }
`;

const FaqMessage = styled(Message)`
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  display: flex;
  align-items: center;
  gap: 10px;
  color: #FFFFFF;
  font-weight: 600;
  border: none;
`;

const ProfileImage = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 6px;
  text-align: ${props => props.$isUser ? 'right' : 'left'};
  font-weight: 500;
`;

const CheckmarkCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #00BC7D;
  border: 2px solid #FFFFFF;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.3);
`;

const CheckmarkInner = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #00BC7D;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  background: ${props => props.disabled ? '#ccc' : 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)'};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 6px 20px rgba(0, 188, 125, 0.4)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

const LoadingIndicator = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-left: 12px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InputContainer = styled.div`
  background: linear-gradient(135deg, #D0FAE5 0%, #B8F5D8 100%);
  border-top: 2px solid #00BC7D;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    gap: 12px;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 16px 24px;
  background: white;
  border: 2px solid transparent;
  border-radius: 30px;
  font-family: 'Raleway', sans-serif;
  font-size: 15px;
  color: #000;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &:focus {
    border-color: #00BC7D;
    box-shadow: 0 4px 16px rgba(0, 188, 125, 0.2);
  }
  
  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 14px 20px;
    font-size: 14px;
  }
`;

const SendButton = styled.button`
  width: 56px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.disabled 
    ? '#ccc' 
    : 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)'};
  border: none;
  border-radius: 50%;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 188, 125, 0.4);
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.1) rotate(15deg)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 6px 24px rgba(0, 188, 125, 0.5)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale(0.95)'};
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 75vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

const ModalHeader = styled.div`
  padding: 28px 32px;
  background: linear-gradient(135deg, #F8FAFF 0%, #EDF2F7 100%);
  border-bottom: 2px solid #E4E4E74D;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #1a202c;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fafbfc;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00BC7D;
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    padding: 20px 16px;
    gap: 12px;
  }
`;

const ModalFooter = styled.div`
  padding: 24px 32px;
  background: white;
  border-top: 2px solid #E4E4E74D;
  display: flex;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  border: none;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  font-size: 32px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 188, 125, 0.4);
  
  &:hover {
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 6px 24px rgba(0, 188, 125, 0.5);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }
`;

const FaqButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 16px;
  background: ${props => props.$selected 
    ? 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)' 
    : '#FFFFFF'};
  border: 2px solid #00BC7D;
  color: ${props => props.$selected ? '#FFFFFF' : '#00BC7D'};
  font-family: 'Raleway', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-20px);
    box-shadow: 0 6px 16px ${props => props.$selected 
      ? 'rgba(0, 188, 125, 0.4)' 
      : 'rgba(0, 0, 0, 0.12)'};
    background: ${props => props.$selected 
      ? 'linear-gradient(135deg, #00A66A 0%, #009958 100%)' 
      : '#F0FDF9'};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;

const OrderItem = styled.div`
  display: flex;
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 2px solid #E4E4E74D;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #00BC7D;
  }
`;

const ImagesContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const OrderImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns};
  grid-template-rows: ${props => props.$rows};
  gap: 3px;
  width: 100%;
  height: 100%;
`;

const GridImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const OrderDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: space-between;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OrderId = styled.div`
  font-size: 16px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #1a202c;
`;

const ItemsCount = styled.div`
  background: #F9F9F9;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #000000;
`;

const ShippingOption = styled.div`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  color: #718096;
  font-weight: 500;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusText = styled.div`
  font-size: 15px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$delivered ? '#00BC7D' : '#1a202c'};
  text-transform: capitalize;
`;

const EmptyState = styled.div`
  padding: 80px 20px;
  text-align: center;
  color: #718096;
  font-family: 'Raleway', sans-serif;
  font-size: 16px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    padding: 60px 16px;
    font-size: 15px;
  }
`;

const LoadingText = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #718096;
  font-family: 'Raleway', sans-serif;
  font-size: 16px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    padding: 40px 16px;
    font-size: 15px;
  }
`;

// Configuration constants
const CHATWOOT_API_TOKEN = 'MZXyJdYgDrRMtJYgKUcTpitM';
const CHATWOOT_ACCOUNT_ID = '1';
const CHATWOOT_INBOX_ID = '1';
const CHATWOOT_API_URL = '/api/chatwoot';
const QUERY_API_URL = '/api/query';
const WEBSOCKET_URL = 'ws://84.54.23.242:9000/cable';

// Constants
const faqs = [
  {
    topic: 'Order Issues',
    query: 'order issues',
    subFaqs: [
      { topic: "Didn't Receive Parcel", query: "didn't receive parcel" },
      { topic: 'Cancel Order', query: 'cancel order' },
      { topic: 'Return Order', query: 'return order' },
      { topic: 'Damaged Package', query: 'damaged package' },
      { topic: 'Other Order Issue', query: 'other order issue' },
    ],
  },
  { topic: 'Item Quality', query: 'item quality' },
  { topic: 'Payment Issues', query: 'payment issues' },
  { topic: 'Technical Assistance', query: 'technical assistance' },
  { topic: 'Other', query: 'other' },
];

const SupportChat = () => {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [selectedSubFaq, setSelectedSubFaq] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [buttonVisibility, setButtonVisibility] = useState({});
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [contactId, setContactId] = useState(null);
  const [ticketMode, setTicketMode] = useState(false);
  const [awaitingUserProblem, setAwaitingUserProblem] = useState(false);
  
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const pollInterval = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isAgentMode && !ticketMode) {
      const greetingMessage = {
        id: Date.now().toString(),
        text: 'Hello! How can I help you today?',
        isUser: false,
        created_at: new Date().toISOString(),
      };
      setMessages([greetingMessage]);
      setButtonVisibility({ [greetingMessage.id]: false });
      setShowFaqModal(true);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
      if (conversationId) {
        axios
          .post(
            `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/resolve`,
            {},
            { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
          )
          .catch((error) => console.error('Failed to resolve conversation:', error));
      }
    };
  }, [conversationId, isAgentMode, ticketMode]);

  const connectWebSocket = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      return;
    }

    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
      
      const subscriptionIdentifier = JSON.stringify({
        channel: 'RoomChannel',
        account_id: CHATWOOT_ACCOUNT_ID,
        inbox_id: CHATWOOT_INBOX_ID,
        conversation_id: conversationId,
      });

      ws.current.send(JSON.stringify({
        command: 'subscribe',
        identifier: subscriptionIdentifier,
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'ping' || data.type === 'welcome' || data.type === 'confirm_subscription') {
        return;
      }

      if (data.message?.event === 'message.created' && data.message.data) {
        const messageData = data.message.data;
        const content = messageData.content;
        const sender = messageData.sender;

        if (content && sender) {
          const isUserMessage = sender.type === 'contact' && sender.id === contactId;
          const newMessage = {
            id: messageData.id.toString(),
            text: content,
            isUser: isUserMessage,
            created_at: messageData.created_at 
              ? new Date(messageData.created_at * 1000).toISOString() 
              : new Date().toISOString(),
          };

          setMessages((prev) => {
            if (!isUserMessage && prev.some((msg) => msg.isLoading)) {
              return [...prev.filter((msg) => !msg.isLoading), newMessage];
            }
            return [...prev, newMessage];
          });

          if (!isUserMessage) {
            setLoading(false);
            setAwaitingUserProblem(false);
          }

          setTimeout(scrollToBottom, 100);
        }
      }
    };

    ws.current.onerror = (error) => console.error('WebSocket error:', error.message);

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      if (reconnectAttempts.current < maxReconnectAttempts && isAgentMode && conversationId) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, delay);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max WebSocket reconnection attempts reached. Falling back to polling.');
        startPolling();
      }
    };
  };

  const startPolling = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);

    pollInterval.current = setInterval(async () => {
      if (conversationId && isAgentMode) {
        try {
          const response = await axios.get(
            `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
            { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
          );

          const payload = response.data.payload;
          if (Array.isArray(payload)) {
            setMessages((prevMessages) => {
              const existingIds = new Set(prevMessages.map((msg) => msg.id));
              const newMessages = payload
                .filter((msg) => !existingIds.has(msg.id.toString()))
                .map((msg) => {
                  const isUserMessage = msg.sender?.type === 'contact' && msg.sender?.id === contactId;
                  return {
                    id: msg.id.toString(),
                    text: msg.content,
                    isUser: isUserMessage,
                    created_at: msg.created_at 
                      ? new Date(msg.created_at * 1000).toISOString() 
                      : new Date().toISOString(),
                  };
                });

              if (newMessages.length > 0) {
                if (newMessages.some((msg) => !msg.isUser) && prevMessages.some((msg) => msg.isLoading)) {
                  return [...prevMessages.filter((msg) => !msg.isLoading), ...newMessages];
                }
                return [...prevMessages, ...newMessages];
              }
              return prevMessages;
            });

            if (payload.length > 0 && payload.some((msg) => msg.sender?.type !== 'contact')) {
              setLoading(false);
              setAwaitingUserProblem(false);
            }

            setTimeout(scrollToBottom, 100);
          }
        } catch (error) {
          console.error('Error polling messages:', error.response?.data || error.message);
        }
      }
    }, 5000);
  };

  useEffect(() => {
    if (isAgentMode && conversationId) {
      connectWebSocket();
      startPolling();
    } else if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [isAgentMode, conversationId]);

  const fetchOrders = async () => {
    if (!profile?.id) return;
    setOrdersLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', profile.id)
        .neq('delivery_status', 'delivered')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Failed to load orders. Please try again.',
          isUser: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const sendQuery = async (queryText) => {
    if (isAgentMode) return;

    const userMessage = {
      id: Date.now().toString(),
      text: queryText,
      isUser: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(QUERY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response_text || 'No response received.',
        isUser: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setButtonVisibility((prev) => ({ ...prev, [botMessage.id]: true }));
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, we couldn\'t process your request. Please try again later.',
        isUser: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setButtonVisibility((prev) => ({ ...prev, [errorMessage.id]: true }));
    } finally {
      setLoading(false);
      setShowFaqModal(false);
    }
  };

  const handleFaqClick = (faq) => {
    if (isAgentMode) return;

    if (faq.subFaqs) {
      setSelectedFaq(faq.topic);
      setSelectedSubFaq(null);
    } else if (faq.topic !== 'Other') {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: faq.topic,
          isUser: true,
          isFaq: true,
          created_at: new Date().toISOString(),
        },
      ]);
      sendQuery(faq.query);
    } else {
      handleClose();
    }
  };

  const handleSubFaqClick = (subFaq) => {
    if (isAgentMode) return;
    setSelectedSubFaq(subFaq.topic);
    const faq = faqs.find((f) => f.topic === selectedFaq);
    if (faq) fetchOrders();
  };

  const handleOrderSelect = (orderId) => {
    if (isAgentMode) return;

    const newSelectedOrderIds = new Set(selectedOrderIds);
    const isSelected = newSelectedOrderIds.has(orderId);

    if (isSelected) {
      newSelectedOrderIds.delete(orderId);
    } else {
      newSelectedOrderIds.add(orderId);
    }

    setSelectedOrderIds(newSelectedOrderIds);

    if (selectedSubFaq && newSelectedOrderIds.size > 0) {
      const faq = faqs.find((f) => f.topic === selectedFaq);
      const selectedSubFaqObj = faq.subFaqs.find((sub) => sub.topic === selectedSubFaq);
      const selectedOrder = orders.find((order) => newSelectedOrderIds.has(order.id.toString()));

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: faq.topic, isUser: true, isFaq: true, created_at: new Date().toISOString() },
        {
          id: (Date.now() + 1).toString(),
          text: selectedSubFaqObj.topic,
          isUser: true,
          isFaq: true,
          created_at: new Date().toISOString(),
        },
      ]);

      if (selectedOrder) {
        const orderDetails = {
          id: selectedOrder.id.toString(),
          items: selectedOrder.items,
          shipping_option: selectedOrder.shipping_option,
          delivery_status: selectedOrder.delivery_status,
          isUser: true,
          isOrder: true,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), ...orderDetails }]);
      }

      const queryText = selectedOrder 
        ? `${selectedSubFaqObj.query} for Order #${selectedOrder.id}` 
        : selectedSubFaqObj.query;
      sendQuery(queryText);
    }
  };

  const handleClose = () => {
    setShowFaqModal(false);
    setSelectedFaq(null);
    setSelectedSubFaq(null);
    setOrders([]);
    setSelectedOrderIds(new Set());
  };

  const handleCustomQuery = () => {
    if (!query.trim()) return;

    if (isAgentMode && awaitingUserProblem) {
      sendInitialAgentMessage(query);
    } else if (isAgentMode) {
      sendMessageToAgent();
    } else if (ticketMode) {
      sendTicket(query);
    } else {
      sendQuery(query);
    }
    setQuery('');
  };

  const createOrGetContact = async () => {
    try {
      const response = await axios.get(
        `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/contacts?email=${profile.email || `${profile.id}@erlli.com`}`,
        { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
      );

      if (response.data.payload.length > 0) {
        setContactId(response.data.payload[0].id);
        return response.data.payload[0].id;
      }

      const createResponse = await axios.post(
        `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`,
        {
          name: profile.name || 'User',
          email: profile.email || `${profile.id}@erlli.com`,
          phone_number: profile.phone || '',
          custom_attributes: { user_id: profile.id },
        },
        { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
      );

      setContactId(createResponse.data.id);
      return createResponse.data.id;
    } catch (error) {
      console.error('Error creating/getting contact:', error.response?.data || error.message);
      throw error;
    }
  };

  const sendInitialAgentMessage = async (initialMessage) => {
    if (!initialMessage.trim() || !conversationId) return;

    setLoading(true);
    setAwaitingUserProblem(false);

    const tempMessageId = Date.now().toString();
    const userMessage = { id: tempMessageId, text: initialMessage, isUser: true, created_at: new Date().toISOString() };

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: (Date.now() + 1).toString(), text: 'Looking for an agent...', isUser: false, isLoading: true, created_at: new Date().toISOString() },
    ]);

    try {
      await axios.post(
        `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/toggle_status`,
        { status: 'open' },
        { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
      );

      const response = await axios.post(
        `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
        { content: initialMessage, message_type: 'incoming' },
        { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
      );

      const serverMessageId = response.data.id?.toString();
      if (serverMessageId) {
        setMessages((prev) => prev.map((msg) => (msg.id === tempMessageId ? { ...msg, id: serverMessageId } : msg)));
      }
    } catch (error) {
      console.error('Error sending initial message to agent:', error.response?.data || error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Failed to send message to agent. Please try again.',
          isUser: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setButtonVisibility((prev) => ({ ...prev, [(Date.now() + 1).toString()]: true }));
      setLoading(false);
    }
  };

  const sendMessageToAgent = async () => {
    if (!query.trim() || !conversationId) return;

    setLoading(true);
    const tempMessageId = Date.now().toString();
    const userMessage = { id: tempMessageId, text: query, isUser: true, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(
        `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
        { content: query, message_type: 'incoming' },
        { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
      );

      const serverMessageId = response.data.id?.toString();
      if (serverMessageId) {
        setMessages((prev) => prev.map((msg) => (msg.id === tempMessageId ? { ...msg, id: serverMessageId } : msg)));
      }

      setQuery('');
    } catch (error) {
      console.error('Error sending message to agent:', error.response?.data || error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Failed to send message to agent. Please try again.',
          isUser: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setButtonVisibility((prev) => ({ ...prev, [(Date.now() + 1).toString()]: true }));
    } finally {
      setLoading(false);
    }
  };

  const sendTicket = async (ticketText) => {
    setLoading(true);
    const ticketMessage = {
      id: Date.now().toString(),
      text: ticketText,
      isUser: true,
      isTicket: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, ticketMessage]);

    try {
      const contactId = await createOrGetContact();

      const conversationResponse = await axios.post(
        `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`,
        {
          inbox_id: CHATWOOT_INBOX_ID,
          contact_id: contactId,
          custom_attributes: { user_name: profile.name || 'User' },
          status: 'open',
          message: { content: ticketText, message_type: 'incoming' },
        },
        { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
      );

      const newConversationId = conversationResponse.data.id;
      console.log('Ticket sent successfully. Conversation ID:', newConversationId);

      const messagesResponse = await axios.get(
        `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${newConversationId}/messages`,
        { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
      );

      const conversationMessages = messagesResponse.data.payload || [];

      if (conversationMessages.length === 0 || !conversationMessages.some(msg => msg.content === ticketText)) {
        await axios.post(
          `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${newConversationId}/messages`,
          { content: ticketText, message_type: 'incoming' },
          { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Ticket submitted successfully!',
          isUser: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error sending ticket:', error.response?.data || error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Failed to submit ticket. Please try again.',
          isUser: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setButtonVisibility((prev) => ({ ...prev, [(Date.now() + 1).toString()]: true }));
    } finally {
      setLoading(false);
      setTicketMode(false);
    }
  };

  const handleReferToAgent = async (messageId) => {
    setButtonVisibility((prev) => ({ ...prev, [messageId]: false }));
    setShowFaqModal(false);
    setMessages([
      {
        id: Date.now().toString(),
        text: 'Please type your problem:',
        isUser: false,
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }

      setConversationId(null);
      setContactId(null);
      setSelectedFaq(null);
      setSelectedSubFaq(null);
      setOrders([]);
      setSelectedOrderIds(new Set());

      const contactId = await createOrGetContact();

      const conversationResponse = await axios.post(
        `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`,
        {
          inbox_id: CHATWOOT_INBOX_ID,
          contact_id: contactId,
          custom_attributes: { user_name: profile.name || 'User' },
          status: 'pending',
        },
        { headers: { 'api_access_token': CHATWOOT_API_TOKEN, 'Content-Type': 'application/json' } }
      );

      const newConversationId = conversationResponse.data.id;
      setConversationId(newConversationId);
      setIsAgentMode(true);
      setAwaitingUserProblem(true);
    } catch (error) {
      console.error('Error transferring to agent:', error.response?.data || error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Failed to connect to agent. Please try again.',
          isUser: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setButtonVisibility((prev) => ({ ...prev, [Date.now().toString()]: true }));
      setLoading(false);
      setAwaitingUserProblem(false);
    }
  };

  const handleSubmitTicket = (messageId) => {
    setButtonVisibility((prev) => ({ ...prev, [messageId]: false }));
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: 'Please type your problem:',
        isUser: false,
        created_at: new Date().toISOString(),
      },
    ]);
    setTicketMode(true);
  };

  const handleAskAnotherQuestion = (messageId) => {
    setButtonVisibility((prev) => ({ ...prev, [messageId]: false }));
    setIsAgentMode(false);
    setConversationId(null);
    setContactId(null);
    setAwaitingUserProblem(false);

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }

    setMessages([]);
    setShowFaqModal(true);
    setLoading(false);
  };

  const renderOrderImages = (items) => {
    const images = items.slice(0, 4).map((product) => product.image_url || 'https://via.placeholder.com/50');

    if (items.length === 1) {
      return <OrderImage src={images[0]} alt="Order item" />;
    } else if (items.length === 2) {
      return (
        <ImageGrid $columns="1fr 1fr" $rows="1fr">
          <GridImage src={images[0]} alt="Order item 1" />
          <GridImage src={images[1]} alt="Order item 2" />
        </ImageGrid>
      );
    } else if (items.length === 3) {
      return (
        <ImageGrid $columns="1fr 1fr" $rows="1fr 1fr">
          <GridImage src={images[0]} alt="Order item 1" style={{ gridColumn: '1', gridRow: '1' }} />
          <GridImage src={images[1]} alt="Order item 2" style={{ gridColumn: '2', gridRow: '1' }} />
          <GridImage src={images[2]} alt="Order item 3" style={{ gridColumn: '1 / 3', gridRow: '2' }} />
        </ImageGrid>
      );
    } else {
      return (
        <ImageGrid $columns="1fr 1fr" $rows="1fr 1fr">
          <GridImage src={images[0]} alt="Order item 1" />
          <GridImage src={images[1]} alt="Order item 2" />
          <GridImage src={images[2]} alt="Order item 3" />
          <GridImage src={images[3]} alt="Order item 4" />
        </ImageGrid>
      );
    }
  };

  const renderMessage = (message) => {
    if (message.isUser) {
      if (message.isFaq) {
        return (
          <MessageWrapper key={message.id} $isUser={true}>
            <ProfileImage src={profile?.avatar_url || 'https://via.placeholder.com/40'} alt="User profile" />
            <FaqMessage>
              <CheckmarkCircle>
                <CheckmarkInner>
                  <IoCheckmark size={16} color="#FFFFFF" />
                </CheckmarkInner>
              </CheckmarkCircle>
              <span>{message.text}</span>
            </FaqMessage>
          </MessageWrapper>
        );
      }

      if (message.isOrder) {
        const isDelivered = message.delivery_status === 'delivered';
        let shippingOptionName = 'Unknown Delivery';
        let shippingOption = message.shipping_option;

        if (typeof shippingOption === 'string') {
          try {
            shippingOption = JSON.parse(shippingOption);
          } catch (error) {
            shippingOption = null;
          }
        }

        if (shippingOption && typeof shippingOption === 'object' && shippingOption.name) {
          shippingOptionName = shippingOption.name;
        }

        return (
          <MessageWrapper key={message.id} $isUser={true}>
            <ProfileImage src={profile?.avatar_url || 'https://via.placeholder.com/40'} alt="User profile" />
            <OrderItem>
              <ImagesContainer>{renderOrderImages(message.items)}</ImagesContainer>
              <OrderDetails>
                <OrderHeader>
                  <OrderId>Order #{message.id}</OrderId>
                  <ItemsCount>{message.items.length} items</ItemsCount>
                </OrderHeader>
                <ShippingOption>{shippingOptionName} Delivery</ShippingOption>
                <StatusRow>
                  <StatusContainer>
                    <StatusText $delivered={isDelivered}>{message.delivery_status}</StatusText>
                    {isDelivered && <IoCheckmarkCircle size={20} color="#00BC7D" />}
                  </StatusContainer>
                </StatusRow>
              </OrderDetails>
            </OrderItem>
          </MessageWrapper>
        );
      }

      return (
        <MessageWrapper key={message.id} $isUser={true}>
          <ProfileImage src={profile?.avatar_url || 'https://via.placeholder.com/40'} alt="User profile" />
          <Message $isUser={true}>
            {message.text}
            <MessageTime $isUser={true}>
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </MessageTime>
          </Message>
        </MessageWrapper>
      );
    }

    return (
      <MessageWrapper key={message.id} $isUser={false}>
        <div>
          <Message $isUser={false}>
            {message.text}
            <MessageTime $isUser={false}>
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </MessageTime>
            {message.isLoading && <LoadingIndicator />}
          </Message>
          {!ticketMode && !isAgentMode && buttonVisibility[message.id] && (
            <ButtonContainer>
              <ActionButton onClick={() => handleReferToAgent(message.id)} disabled={loading}>
                Refer to Agent
              </ActionButton>
              <ActionButton onClick={() => handleSubmitTicket(message.id)} disabled={loading}>
                Submit Ticket
              </ActionButton>
              <ActionButton onClick={() => handleAskAnotherQuestion(message.id)} disabled={loading}>
                Ask Another Question
              </ActionButton>
            </ButtonContainer>
          )}
        </div>
      </MessageWrapper>
    );
  };

  const renderOrderItem = (order) => {
    const isDelivered = order.delivery_status === 'delivered';
    let shippingOptionName = 'Unknown Delivery';
    let shippingOption = order.shipping_option;

    if (typeof shippingOption === 'string') {
      try {
        shippingOption = JSON.parse(shippingOption);
      } catch (error) {
        shippingOption = null;
      }
    }

    if (shippingOption && typeof shippingOption === 'object' && shippingOption.name) {
      shippingOptionName = shippingOption.name;
    }

    const isSelected = selectedOrderIds.has(order.id.toString());

    return (
      <OrderItem key={order.id} onClick={() => handleOrderSelect(order.id.toString())}>
        <ImagesContainer>{renderOrderImages(order.items)}</ImagesContainer>
        <OrderDetails>
          <OrderHeader>
            <OrderId>Order #{order.id}</OrderId>
            <ItemsCount>{order.items.length} items</ItemsCount>
          </OrderHeader>
          <ShippingOption>{shippingOptionName} Delivery</ShippingOption>
          <StatusRow>
            <StatusContainer>
              <StatusText $delivered={isDelivered}>{order.delivery_status}</StatusText>
              {isDelivered && <IoCheckmarkCircle size={20} color="#00BC7D" />}
            </StatusContainer>
            <FaqButton
              $selected={isSelected}
              onClick={(e) => {
                e.stopPropagation();
                handleOrderSelect(order.id.toString());
              }}
              disabled={loading || isAgentMode}
            >
              {isSelected && (
                <CheckmarkCircle>
                  <CheckmarkInner>
                    <IoCheckmark size={16} color="#FFFFFF" />
                  </CheckmarkInner>
                </CheckmarkCircle>
              )}
              <span>{isSelected ? 'Selected' : 'Select'}</span>
            </FaqButton>
          </StatusRow>
        </OrderDetails>
      </OrderItem>
    );
  };

  return (
    <PageContainer>
      <MainContent>
        <ChatContainer>
          <Header>
            <LogoContainer>
              <CircleContainer>
                <InnerCircle>
                  <HeaderIcon src={juliaLogo2} alt="Julia Logo" />
                </InnerCircle>
              </CircleContainer>
              <HeaderImage src={juliaBlack} alt="Julia" />
            </LogoContainer>
          </Header>

          <MessagesContainer>
            {messages.length === 0 ? (
              <EmptyState>Start a conversation...</EmptyState>
            ) : (
              messages.map(renderMessage)
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputContainer>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomQuery()}
              placeholder={
                awaitingUserProblem
                  ? 'Please type your problem...'
                  : isAgentMode
                  ? 'Message agent...'
                  : 'Type a message...'
              }
              disabled={awaitingUserProblem ? false : loading}
            />
            <SendButton onClick={handleCustomQuery} disabled={loading || !query.trim()}>
              <IoSend size={24} />
            </SendButton>
          </InputContainer>
        </ChatContainer>
      </MainContent>

      {showFaqModal && (
        <ModalOverlay onClick={handleClose}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {selectedSubFaq ? selectedSubFaq : selectedFaq ? selectedFaq : 'How can we help you?'}
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              {selectedSubFaq ? (
                ordersLoading ? (
                  <LoadingText>Loading orders...</LoadingText>
                ) : orders.length > 0 ? (
                  orders.map(renderOrderItem)
                ) : (
                  <EmptyState>No pending orders</EmptyState>
                )
              ) : selectedFaq && faqs.find((f) => f.topic === selectedFaq)?.subFaqs ? (
                faqs.find((f) => f.topic === selectedFaq).subFaqs.map((subFaq) => (
                  <FaqButton
                    key={subFaq.topic}
                    $selected={selectedSubFaq === subFaq.topic}
                    onClick={() => handleSubFaqClick(subFaq)}
                    disabled={loading}
                  >
                    {selectedSubFaq === subFaq.topic && (
                      <CheckmarkCircle>
                        <CheckmarkInner>
                          <IoCheckmark size={16} color="#FFFFFF" />
                        </CheckmarkInner>
                      </CheckmarkCircle>
                    )}
                    <span>{subFaq.topic}</span>
                  </FaqButton>
                ))
              ) : (
                faqs.map((faq) => (
                  <FaqButton
                    key={faq.topic}
                    $selected={selectedFaq === faq.topic}
                    onClick={() => handleFaqClick(faq)}
                    disabled={loading}
                  >
                    {selectedFaq === faq.topic && (
                      <CheckmarkCircle>
                        <CheckmarkInner>
                          <IoCheckmark size={16} color="#FFFFFF" />
                        </CheckmarkInner>
                      </CheckmarkCircle>
                    )}
                    <span>{faq.topic}</span>
                  </FaqButton>
                ))
              )}
            </ModalBody>
            <ModalFooter>
              <CloseButton onClick={handleClose}>×</CloseButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default SupportChat;