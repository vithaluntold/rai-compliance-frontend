import { useWebSocket } from '@/hooks/useWebSocket';

interface ProgressContextType {
  progress: number;
  status: string;
  message: string | null;
  error: string | null;
  isConnected: boolean;
  currentStep: number;
  totalSteps: number;
  details: unknown;
}

const defaultContext: ProgressContextType = {
  progress: 0,
  status: "idle",
  message: null,
  error: null,
  isConnected: false,
  currentStep: 0,
  totalSteps: 0,
  details: null,
};

const ProgressContext = createContext<ProgressContextType>(defaultContext);

export const useProgress = () => useContext(ProgressContext);

interface ProgressProviderProps {
  children: React.ReactNode;
  documentId?: string;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({
  children,
  documentId,
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [details, setDetails] = useState<any>(null);

  const handleMessage = useCallback((data: unknown) => {
    if (data.current_step && data.total_steps) {
      const progressValue = (data.current_step / data.total_steps) * 100;
      setProgress(progressValue);
      setCurrentStep(data.current_step);
      setTotalSteps(data.total_steps);
    }

    if (data.status) {
      setStatus(data.status);
    }

    if (data.message) {
      setMessage(data.message);
    }

    if (data.data) {
      setDetails(data.data);
    }
  }, []);

  // // Temporary fallback values until WebSocket is implemented
  const isConnected = false;

  const value = {
    progress,
    status,
    message,
    error,
    isConnected,
    currentStep,
    totalSteps,
    details,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
