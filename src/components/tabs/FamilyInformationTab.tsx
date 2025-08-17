import { useState } from "react";
import { umisApiService } from "../../lib/umisApiService";
import type { UmisTokensRecord } from "../../lib/xata.codegen";
import { Button } from "../ui/button";
import { Combobox } from "../ui/combobox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { StudentFormData } from "../StudentRegistrationWizard";

interface FamilyInformationTabProps {
	formData: StudentFormData;
	updateFormData: (updates: Partial<StudentFormData>) => void;
	validationErrors: Record<string, string>;
	currentToken: UmisTokensRecord | null;
}

export const FamilyInformationTab = ({
	formData,
	updateFormData,
	validationErrors,
	currentToken,
}: FamilyInformationTabProps) => {
	// State for loading student info
	const [isLoadingStudentInfo, setIsLoadingStudentInfo] = useState(false);
	const [loadResult, setLoadResult] = useState<{
		success: boolean;
		message: string;
	} | null>(null);

	// Occupation options
	const occupationOptions = [
		{ label: "Agriculture", value: "Agriculture" },
		{ label: "Business", value: "Business" },
		{ label: "Government Service", value: "Government Service" },
		{ label: "Private Service", value: "Private Service" },
		{ label: "Self-employed", value: "Self-employed" },
		{ label: "Daily Wage", value: "Daily Wage" },
		{ label: "Housewife", value: "Housewife" },
		{ label: "Retired", value: "Retired" },
		{ label: "Not Applicable", value: "Not Applicable" },
		{ label: "Others", value: "Others" },
	];

	// Validate mobile number format
	const validateMobile = (mobile: string) => {
		const mobileRegex = /^[6-9]\d{9}$/;
		return mobileRegex.test(mobile);
	};

	// Format annual income with commas
	const formatIncome = (value: string) => {
		const numericValue = value.replace(/\D/g, "");
		return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	};

	// Load student family information from API
	const handleLoadStudentInfo = async () => {
		if (!currentToken?.token) {
			setLoadResult({
				success: false,
				message: "Authentication required. Please login first.",
			});
			return;
		}

		setIsLoadingStudentInfo(true);
		setLoadResult(null);

		try {
			// Using placeholder student ID - this should be dynamic
			const studentId = 6693300;

			const studentInfo = await umisApiService.getStudentInfo(
				studentId,
				currentToken.token,
			);

			// Update form data with loaded information
			updateFormData({
				fatherName: studentInfo.fatherName || "",
				fatherOccupation: getOccupationLabel(studentInfo.fatherOccupationId),
				motherName: studentInfo.motherName || "",
				motherOccupation: getOccupationLabel(studentInfo.motherOccupationId),
				guardianName: studentInfo.guardianName || "",
				isOrphan: studentInfo.isOrphan ? "yes" : "no",
				familyAnnualIncome: studentInfo.familyAnnualIncome.toString(),
				parentMobileNumber: studentInfo.parentMobileNo || "",
				incomeCertificateNumber: studentInfo.incomeCertificateNumber || "",
			});

			setLoadResult({
				success: true,
				message: "Family information loaded successfully!",
			});
		} catch (error) {
			console.error("Error loading student info:", error);
			setLoadResult({
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Failed to load family information",
			});
		} finally {
			setIsLoadingStudentInfo(false);
		}
	};

	// Helper function to get occupation label from ID
	const getOccupationLabel = (occupationId: number): string => {
		const occupationMap: Record<number, string> = {
			10: "Private Service",
			102: "Housewife",
			103: "Business",
			// Add more mappings as needed
		};
		return occupationMap[occupationId] || "Others";
	};

	return (
		<div className="space-y-8">
			<div className="text-center">
				<h3 className="text-xl font-semibold text-blue-600 mb-2">Family Information</h3>
				<p className="text-gray-600 text-sm">Please provide details about your family members</p>
			</div>

			{/* Load Student Info Section */}
			<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-lg font-semibold text-blue-800">Load Existing Information</h4>
						<p className="text-sm text-blue-600">Load family information from your student record</p>
					</div>
					<Button
						onClick={handleLoadStudentInfo}
						disabled={isLoadingStudentInfo || !currentToken?.token}
						className="bg-blue-600 hover:bg-blue-700"
					>
						{isLoadingStudentInfo ? "Loading..." : "Load Info"}
					</Button>
				</div>

				{/* Load Result Display */}
				{loadResult && (
					<div
						className={`mt-4 p-3 rounded-md ${
							loadResult.success
								? "bg-green-50 border border-green-200 text-green-800"
								: "bg-red-50 border border-red-200 text-red-800"
						}`}
					>
						<p className="text-sm font-medium">
							{loadResult.success ? "✅" : "❌"} {loadResult.message}
						</p>
					</div>
				)}
			</div>

			{/* Parents Information */}
			<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
				<h4 className="text-lg font-semibold text-blue-800 mb-4">Parents/Guardian Information</h4>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Father's Information */}
					<div className="space-y-4">
						<h5 className="font-medium text-blue-700 border-b border-blue-200 pb-2">Father's/Guardian's Details</h5>
						
						<div className="space-y-2">
							<Label htmlFor="fatherName">Father's/Guardian's Name *</Label>
							<Input
								id="fatherName"
								value={formData.fatherName}
								onChange={(e) => updateFormData({ fatherName: e.target.value })}
								placeholder="Enter father's/guardian's name"
							/>
							{validationErrors.fatherName && (
								<p className="text-red-600 text-sm">{validationErrors.fatherName}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="fatherOccupation">Father's/Guardian's Occupation *</Label>
							<Combobox
								options={occupationOptions}
								value={formData.fatherOccupation}
								onValueChange={(value) => updateFormData({ fatherOccupation: value })}
								placeholder="Select occupation"
								searchPlaceholder="Search occupation..."
							/>
							{validationErrors.fatherOccupation && (
								<p className="text-red-600 text-sm">{validationErrors.fatherOccupation}</p>
							)}
						</div>
					</div>

					{/* Mother's Information */}
					<div className="space-y-4">
						<h5 className="font-medium text-blue-700 border-b border-blue-200 pb-2">Mother's Details</h5>
						
						<div className="space-y-2">
							<Label htmlFor="motherName">Mother's Name *</Label>
							<Input
								id="motherName"
								value={formData.motherName}
								onChange={(e) => updateFormData({ motherName: e.target.value })}
								placeholder="Enter mother's name"
							/>
							{validationErrors.motherName && (
								<p className="text-red-600 text-sm">{validationErrors.motherName}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="motherOccupation">Mother's Occupation *</Label>
							<Combobox
								options={occupationOptions}
								value={formData.motherOccupation}
								onValueChange={(value) => updateFormData({ motherOccupation: value })}
								placeholder="Select occupation"
								searchPlaceholder="Search occupation..."
							/>
							{validationErrors.motherOccupation && (
								<p className="text-red-600 text-sm">{validationErrors.motherOccupation}</p>
							)}
						</div>
					</div>
				</div>

				{/* Guardian Information (if different from father) */}
				<div className="mt-6 space-y-2">
					<Label htmlFor="guardianName">Guardian Name (if different from father)</Label>
					<Input
						id="guardianName"
						value={formData.guardianName}
						onChange={(e) => updateFormData({ guardianName: e.target.value })}
						placeholder="Enter guardian's name (if applicable)"
					/>
					<p className="text-sm text-gray-600">
						Leave blank if father is the primary guardian
					</p>
				</div>
			</div>

			{/* Orphan Status */}
			<div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
				<h4 className="text-lg font-semibold text-yellow-800 mb-4">Special Status</h4>
				
				<div className="space-y-2">
					<Label>Orphan Category Status *</Label>
					<div className="flex gap-6">
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="isOrphan"
								value="yes"
								checked={formData.isOrphan === "yes"}
								onChange={(e) => updateFormData({ isOrphan: e.target.value as "yes" | "no" })}
								className="text-yellow-600"
							/>
							<span className="text-sm">Yes</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="isOrphan"
								value="no"
								checked={formData.isOrphan === "no"}
								onChange={(e) => updateFormData({ isOrphan: e.target.value as "yes" | "no" })}
								className="text-yellow-600"
							/>
							<span className="text-sm">No</span>
						</label>
					</div>
					{validationErrors.isOrphan && (
						<p className="text-red-600 text-sm">{validationErrors.isOrphan}</p>
					)}
				</div>
			</div>

			{/* Financial Information */}
			<div className="bg-green-50 p-6 rounded-lg border border-green-200">
				<h4 className="text-lg font-semibold text-green-800 mb-4">Financial Information</h4>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="familyAnnualIncome">Annual Family Income (₹) *</Label>
						<Input
							id="familyAnnualIncome"
							value={formData.familyAnnualIncome}
							onChange={(e) => {
								const formatted = formatIncome(e.target.value);
								updateFormData({ familyAnnualIncome: formatted });
							}}
							placeholder="Enter annual family income"
						/>
						{validationErrors.familyAnnualIncome && (
							<p className="text-red-600 text-sm">{validationErrors.familyAnnualIncome}</p>
						)}
						<p className="text-sm text-gray-600">
							Enter the total annual income of the family in rupees
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="parentMobileNumber">Parents Mobile Number *</Label>
						<Input
							id="parentMobileNumber"
							value={formData.parentMobileNumber}
							onChange={(e) => {
								const value = e.target.value.replace(/\D/g, "").slice(0, 10);
								updateFormData({ parentMobileNumber: value });
							}}
							placeholder="10-digit mobile number"
							maxLength={10}
						/>
						{validationErrors.parentMobileNumber && (
							<p className="text-red-600 text-sm">{validationErrors.parentMobileNumber}</p>
						)}
						{formData.parentMobileNumber && !validateMobile(formData.parentMobileNumber) && (
							<p className="text-red-600 text-sm">Please enter a valid 10-digit mobile number</p>
						)}
					</div>
				</div>
			</div>

			{/* Income Certificate */}
			<div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
				<h4 className="text-lg font-semibold text-purple-800 mb-4">Income Certificate</h4>
				
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="incomeCertificateNumber">Income Certificate Number *</Label>
						<Input
							id="incomeCertificateNumber"
							value={formData.incomeCertificateNumber}
							onChange={(e) => updateFormData({ incomeCertificateNumber: e.target.value })}
							placeholder="Enter income certificate number"
						/>
						{validationErrors.incomeCertificateNumber && (
							<p className="text-red-600 text-sm">{validationErrors.incomeCertificateNumber}</p>
						)}
					</div>

					<div className="bg-purple-100 p-4 rounded-md">
						<p className="text-sm text-purple-800 font-medium mb-2">
							📋 Income Certificate Requirements:
						</p>
						<ul className="text-sm text-purple-700 space-y-1">
							<li>• Certificate should be issued by competent authority</li>
							<li>• Should be valid and not expired</li>
							<li>• Income mentioned should match the annual family income entered above</li>
							<li>• Certificate will be verified during the admission process</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Additional Notes */}
			<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
				<h5 className="font-medium text-gray-800 mb-2">📝 Important Notes:</h5>
				<ul className="text-sm text-gray-700 space-y-1">
					<li>• All family information will be verified during the admission process</li>
					<li>• Ensure all details match with your official documents</li>
					<li>• Income certificate and supporting documents may be required for verification</li>
					<li>• Any false information may lead to cancellation of admission</li>
					<li>• This information is loaded from your existing student record</li>
					<li>• To update family information, contact the administration office</li>
				</ul>
			</div>

			{/* Information Note */}
			<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
				<div className="flex items-center justify-center">
					<div className="text-center">
						<h4 className="text-lg font-semibold text-blue-800 mb-2">📊 Family Information Display</h4>
						<p className="text-sm text-blue-600">
							This tab displays your family information from the student record.
							Use the "Load Info" button above to fetch your latest family details.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};