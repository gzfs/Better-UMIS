import { Check } from "lucide-react";
import { cn } from "../lib/utils";

export interface Step {
	id: string;
	title: string;
	status: "completed" | "current" | "pending";
}

interface ProgressStepperProps {
	steps: Step[];
	onStepClick?: (stepId: string) => void;
	className?: string;
}

export const ProgressStepper = ({ steps, onStepClick, className }: ProgressStepperProps) => {
	return (
		<div className={cn("w-full py-4", className)}>
			<div className="flex items-center justify-between">
				{steps.map((step, index) => (
					<div
						key={step.id}
						className="flex flex-col items-center flex-1 relative"
					>
						{/* Progress Line */}
						{index < steps.length - 1 && (
							<div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 z-0">
								<div 
									className={cn(
										"h-full transition-all duration-300",
										step.status === "completed" ? "bg-green-500" : "bg-gray-200"
									)}
								/>
							</div>
						)}
						
						{/* Step Circle */}
						<button
							onClick={() => onStepClick?.(step.id)}
							disabled={step.status === "pending"}
							className={cn(
								"relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200",
								"disabled:cursor-not-allowed",
								step.status === "completed" && "bg-green-500 border-green-500 text-white",
								step.status === "current" && "bg-blue-500 border-blue-500 text-white",
								step.status === "pending" && "bg-gray-100 border-gray-300 text-gray-400"
							)}
						>
							{step.status === "completed" ? (
								<Check className="w-5 h-5" />
							) : (
								<span className="text-sm font-medium">{index + 1}</span>
							)}
						</button>
						
						{/* Step Title */}
						<span
							className={cn(
								"mt-2 text-xs font-medium text-center max-w-20 leading-tight",
								step.status === "completed" && "text-green-600",
								step.status === "current" && "text-blue-600", 
								step.status === "pending" && "text-gray-400"
							)}
						>
							{step.title}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};