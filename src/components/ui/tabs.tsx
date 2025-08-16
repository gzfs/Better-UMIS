import { createContext, forwardRef, useContext, useState } from "react";
import { cn } from "../../lib/utils";

type TabsContextValue = {
	value?: string;
	onValueChange?: (value: string) => void;
	orientation?: "horizontal" | "vertical";
};

const TabsContext = createContext<TabsContextValue>({});

interface TabsProps {
	value?: string;
	onValueChange?: (value: string) => void;
	orientation?: "horizontal" | "vertical";
	className?: string;
	children: React.ReactNode;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
	({ value, onValueChange, orientation = "horizontal", className, children }, ref) => {
		return (
			<TabsContext.Provider value={{ value, onValueChange, orientation }}>
				<div
					ref={ref}
					className={cn("w-full", className)}
					data-orientation={orientation}
				>
					{children}
				</div>
			</TabsContext.Provider>
		);
	}
);
Tabs.displayName = "Tabs";

interface TabsListProps {
	className?: string;
	children: React.ReactNode;
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
	({ className, children }, ref) => {
		const { orientation } = useContext(TabsContext);
		
		return (
			<div
				ref={ref}
				className={cn(
					"inline-flex items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
					orientation === "vertical" ? "flex-col" : "flex-row",
					className
				)}
				data-orientation={orientation}
			>
				{children}
			</div>
		);
	}
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps {
	value: string;
	className?: string;
	children: React.ReactNode;
	disabled?: boolean;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
	({ value, className, children, disabled = false }, ref) => {
		const { value: contextValue, onValueChange } = useContext(TabsContext);
		const isSelected = contextValue === value;

		return (
			<button
				ref={ref}
				type="button"
				disabled={disabled}
				className={cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
					"disabled:pointer-events-none disabled:opacity-50",
					isSelected
						? "bg-white text-gray-950 shadow-sm"
						: "text-gray-600 hover:text-gray-900",
					className
				)}
				onClick={() => !disabled && onValueChange?.(value)}
				data-state={isSelected ? "active" : "inactive"}
			>
				{children}
			</button>
		);
	}
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps {
	value: string;
	className?: string;
	children: React.ReactNode;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
	({ value, className, children }, ref) => {
		const { value: contextValue } = useContext(TabsContext);
		const isSelected = contextValue === value;

		if (!isSelected) return null;

		return (
			<div
				ref={ref}
				className={cn(
					"mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
					className
				)}
				data-state={isSelected ? "active" : "inactive"}
			>
				{children}
			</div>
		);
	}
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };