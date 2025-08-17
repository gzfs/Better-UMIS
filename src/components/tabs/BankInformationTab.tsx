import { useState } from "react";
import { umisApiService } from "../../lib/umisApiService";
import type { UmisTokensRecord } from "../../lib/xata.codegen";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { StudentFormData } from "../StudentRegistrationWizard";

interface BankInformationTabProps {
	formData: StudentFormData;
	updateFormData: (updates: Partial<StudentFormData>) => void;
	validationErrors: Record<string, string>;
	currentToken: UmisTokensRecord | null;
}

export const BankInformationTab = ({
	formData,
	updateFormData,
	validationErrors,
	currentToken,
}: BankInformationTabProps) => {
	const [ifscValidation, setIfscValidation] = useState<{
		isValid: boolean;
		bankDetails: any;
		isLoading: boolean;
	}>({
		isValid: false,
		bankDetails: null,
		isLoading: false,
	});

	// Validate IFSC code format
	const validateIFSC = (ifsc: string) => {
		const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
		return ifscRegex.test(ifsc);
	};

	// Validate account number (basic validation)
	const validateAccountNumber = (accountNumber: string) => {
		// Account number should be 9-18 digits
		const accountRegex = /^\d{9,18}$/;
		return accountRegex.test(accountNumber);
	};

	// Fetch bank details using IFSC code from UMIS API
	const fetchBankDetails = async (ifscCode: string) => {
		if (!validateIFSC(ifscCode)) {
			setIfscValidation({ isValid: false, bankDetails: null, isLoading: false });
			return;
		}

		if (!currentToken?.token) {
			setIfscValidation({ isValid: false, bankDetails: null, isLoading: false });
			console.error("Authentication token required for IFSC lookup");
			return;
		}

		setIfscValidation(prev => ({ ...prev, isLoading: true }));

		try {
			// Use UMIS API for IFSC lookup
			const bankBranches = await umisApiService.getBankBranchByIFSC(
				ifscCode,
				currentToken.token,
			);

			if (bankBranches.length > 0) {
				const bankDetails = bankBranches[0]; // Take the first result
				setIfscValidation({
					isValid: true,
					bankDetails,
					isLoading: false,
				});

				// Auto-fill bank name and branch if available
				updateFormData({
					bankName: bankDetails.bankName || "",
					bankBranch: bankDetails.name || "",
					city: bankDetails.cityName || "",
				});
			} else {
				setIfscValidation({
					isValid: false,
					bankDetails: null,
					isLoading: false,
				});
			}
		} catch (error) {
			console.error("Error fetching bank details:", error);
			setIfscValidation({
				isValid: false,
				bankDetails: null,
				isLoading: false,
			});
		}
	};

	// Handle IFSC code change
	const handleIFSCChange = (value: string) => {
		const uppercaseValue = value.toUpperCase();
		updateFormData({ ifscCode: uppercaseValue });
		
		if (uppercaseValue.length === 11) {
			fetchBankDetails(uppercaseValue);
		} else {
			setIfscValidation({ isValid: false, bankDetails: null, isLoading: false });
		}
	};

	return (
		<div className="space-y-8">
			<div className="text-center">
				<h3 className="text-xl font-semibold text-blue-600 mb-2">Bank Information</h3>
				<p className="text-gray-600 text-sm">Please provide your bank account details for scholarship/fee transactions</p>
			</div>

			{/* Important Notice */}
			<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
				<div className="flex items-start space-x-3">
					<div className="text-yellow-600 text-xl">⚠️</div>
					<div>
						<h4 className="font-medium text-yellow-800 mb-1">Important Notice</h4>
						<p className="text-sm text-yellow-700 mb-2">
							Ensure that the bank account belongs to the student or their parent/guardian. 
							This account will be used for all financial transactions including scholarships, fee refunds, etc.
						</p>
						{!currentToken?.token && (
							<p className="text-sm text-yellow-700 font-medium">
								⚠️ Authentication required for IFSC validation - Please login first.
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Bank Account Details */}
			<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
				<h4 className="text-lg font-semibold text-blue-800 mb-4">Account Details</h4>
				
				<div className="space-y-6">
					{/* Account Number */}
					<div className="space-y-2">
						<Label htmlFor="accountNumber">Account Number *</Label>
						<Input
							id="accountNumber"
							value={formData.accountNumber}
							onChange={(e) => {
								const value = e.target.value.replace(/\D/g, "");
								updateFormData({ accountNumber: value });
							}}
							placeholder="Enter your bank account number"
							maxLength={18}
						/>
						{validationErrors.accountNumber && (
							<p className="text-red-600 text-sm">{validationErrors.accountNumber}</p>
						)}
						{formData.accountNumber && !validateAccountNumber(formData.accountNumber) && (
							<p className="text-red-600 text-sm">Account number should be 9-18 digits</p>
						)}
						<p className="text-sm text-gray-600">
							Enter your bank account number (numbers only, 9-18 digits)
						</p>
					</div>

					{/* Confirm Account Number */}
					<div className="space-y-2">
						<Label htmlFor="confirmAccountNumber">Confirm Account Number *</Label>
						<Input
							id="confirmAccountNumber"
							onChange={(e) => {
								e.target.value.replace(/\D/g, "");
								// You might want to add this to form data for validation
							}}
							placeholder="Re-enter your bank account number"
							maxLength={18}
						/>
						<p className="text-sm text-gray-600">
							Please re-enter your account number to confirm
						</p>
					</div>

					{/* IFSC Code */}
					<div className="space-y-2">
						<Label htmlFor="ifscCode">IFSC Code *</Label>
						<div className="relative">
							<Input
								id="ifscCode"
								value={formData.ifscCode}
								onChange={(e) => handleIFSCChange(e.target.value)}
								placeholder="Enter IFSC code (e.g., SBIN0001234)"
								maxLength={11}
								className={`${
									formData.ifscCode.length === 11
										? ifscValidation.isValid
											? "border-green-500 bg-green-50"
											: "border-red-500 bg-red-50"
										: ""
								}`}
							/>
							{ifscValidation.isLoading && (
								<div className="absolute right-3 top-3">
									<div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
								</div>
							)}
						</div>
						{validationErrors.ifscCode && (
							<p className="text-red-600 text-sm">{validationErrors.ifscCode}</p>
						)}
						{formData.ifscCode && !validateIFSC(formData.ifscCode) && (
							<p className="text-red-600 text-sm">
								IFSC code format: 4 letters + 0 + 6 characters (e.g., SBIN0001234)
							</p>
						)}
						{ifscValidation.isValid && (
							<p className="text-green-600 text-sm">✓ Valid IFSC code</p>
						)}
						<p className="text-sm text-gray-600">
							11-character code starting with 4 letters followed by 0 and 6 characters
						</p>
					</div>
				</div>
			</div>

			{/* Bank Details (Auto-filled or Manual) */}
			<div className="bg-green-50 p-6 rounded-lg border border-green-200">
				<h4 className="text-lg font-semibold text-green-800 mb-4">Bank Details</h4>
				
				{ifscValidation.bankDetails && (
					<div className="mb-4 p-3 bg-green-100 rounded-md">
						<p className="text-sm text-green-700 font-medium">
							✓ Bank details auto-filled from IFSC code
						</p>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="bankName">Bank Name *</Label>
						<Input
							id="bankName"
							value={formData.bankName}
							onChange={(e) => updateFormData({ bankName: e.target.value })}
							placeholder="Enter bank name"
							readOnly={ifscValidation.isValid}
							className={ifscValidation.isValid ? "bg-gray-100" : ""}
						/>
						{validationErrors.bankName && (
							<p className="text-red-600 text-sm">{validationErrors.bankName}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="bankBranch">Bank Branch *</Label>
						<Input
							id="bankBranch"
							value={formData.bankBranch}
							onChange={(e) => updateFormData({ bankBranch: e.target.value })}
							placeholder="Enter branch name"
							readOnly={ifscValidation.isValid}
							className={ifscValidation.isValid ? "bg-gray-100" : ""}
						/>
						{validationErrors.bankBranch && (
							<p className="text-red-600 text-sm">{validationErrors.bankBranch}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="city">City *</Label>
						<Input
							id="city"
							value={formData.city}
							onChange={(e) => updateFormData({ city: e.target.value })}
							placeholder="Enter city name"
							readOnly={ifscValidation.isValid}
							className={ifscValidation.isValid ? "bg-gray-100" : ""}
						/>
						{validationErrors.city && (
							<p className="text-red-600 text-sm">{validationErrors.city}</p>
						)}
					</div>
				</div>

				{ifscValidation.bankDetails && (
					<div className="mt-4 p-4 bg-white rounded-md border">
						<h5 className="font-medium text-gray-800 mb-2">Bank Information:</h5>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium text-gray-600">Bank:</span>
								<span className="ml-2">{ifscValidation.bankDetails.bankName}</span>
							</div>
							<div>
								<span className="font-medium text-gray-600">Branch:</span>
								<span className="ml-2">{ifscValidation.bankDetails.name}</span>
							</div>
							<div>
								<span className="font-medium text-gray-600">Address:</span>
								<span className="ml-2">{ifscValidation.bankDetails.address}</span>
							</div>
							<div>
								<span className="font-medium text-gray-600">City:</span>
								<span className="ml-2">{ifscValidation.bankDetails.cityName}</span>
							</div>
							<div>
								<span className="font-medium text-gray-600">IFSC:</span>
								<span className="ml-2">{ifscValidation.bankDetails.ifsc}</span>
							</div>
							<div>
								<span className="font-medium text-gray-600">Bank ID:</span>
								<span className="ml-2">{ifscValidation.bankDetails.bankId}</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Account Type Information */}
			<div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
				<h4 className="text-lg font-semibold text-purple-800 mb-4">Account Requirements</h4>
				
				<div className="space-y-3">
					<div className="flex items-start space-x-3">
						<div className="text-purple-600 text-lg">✓</div>
						<p className="text-sm text-purple-700">
							<strong>Savings Account:</strong> Preferred account type for students
						</p>
					</div>
					<div className="flex items-start space-x-3">
						<div className="text-purple-600 text-lg">✓</div>
						<p className="text-sm text-purple-700">
							<strong>Active Account:</strong> Account should be active and operational
						</p>
					</div>
					<div className="flex items-start space-x-3">
						<div className="text-purple-600 text-lg">✓</div>
						<p className="text-sm text-purple-700">
							<strong>KYC Compliant:</strong> Account should have completed KYC verification
						</p>
					</div>
					<div className="flex items-start space-x-3">
						<div className="text-purple-600 text-lg">✓</div>
						<p className="text-sm text-purple-700">
							<strong>Ownership:</strong> Account should belong to student or their parent/guardian
						</p>
					</div>
				</div>
			</div>

			{/* Additional Notes */}
			<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
				<h5 className="font-medium text-gray-800 mb-2">📋 Important Notes:</h5>
				<ul className="text-sm text-gray-700 space-y-1">
					<li>• Bank account details will be verified during the admission process</li>
					<li>• Ensure the account is active and has the correct name as per records</li>
					<li>• This account will be used for all financial transactions</li>
					<li>• Joint accounts are acceptable if the student is one of the account holders</li>
					<li>• Keep your bank passbook/statement ready for verification</li>
					<li>• IFSC validation uses UMIS database for accurate bank information</li>
					<li>• Authentication is required for IFSC lookup functionality</li>
				</ul>
			</div>
		</div>
	);
};