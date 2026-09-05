import React from 'react';
import { CheckCircle, Clock, Truck, Package } from 'lucide-react';

interface OrderStatusTrackerProps {
  status: string;
}

const steps = [
  { key: 'Pending', label: 'Pending', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Package },
];

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ status }) => {
  const statusOrder = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const cancelled = status === 'Cancelled';
  const currentIndex = cancelled ? -1 : statusOrder.indexOf(status);

  if (cancelled) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-medium">
          Order Cancelled
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                } ${isCurrent ? 'ring-4 ring-indigo-200 dark:ring-indigo-800' : ''}`}
              >
                <Icon size={20} />
              </div>
              <span className={`text-xs mt-2 font-medium ${
                isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 mb-6">
                <div className={`h-1 rounded-full transition-all duration-300 ${
                  index < currentIndex ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OrderStatusTracker;
