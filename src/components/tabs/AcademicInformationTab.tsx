import { useState } from "react";
import {
	transformAcademicInfoToPayload,
	umisApiService,
} from "../../lib/umisApiService";
import type { UmisTokensRecord } from "../../lib/xata.codegen";
import { Button } from "../ui/button";
import { Combobox } from "../ui/combobox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { StudentFormData } from "../StudentRegistrationWizard";

interface AcademicInformationTabProps {
	formData: StudentFormData;
	updateFormData: (updates: Partial<StudentFormData>) => void;
	validationErrors: Record<string, string>;
	currentToken: UmisTokensRecord | null;
}

export const AcademicInformationTab = ({
	formData,
	updateFormData,
	validationErrors,
	currentToken,
}: AcademicInformationTabProps) => {
	// Save functionality state
	const [isSaving, setIsSaving] = useState(false);
	const [saveResult, setSaveResult] = useState<{
		success: boolean;
		message: string;
	} | null>(null);
	// Academic Year options
	const academicYearOptions = [
		{ label: "2024-2025", value: "2024-2025" },
		{ label: "2023-2024", value: "2023-2024" },
		{ label: "2022-2023", value: "2022-2023" },
		{ label: "2021-2022", value: "2021-2022" },
		{ label: "2020-2021", value: "2020-2021" },
	];

	// Stream Type options
	const streamTypeOptions = [
		{ label: "Arts", value: "Arts" },
		{ label: "Science", value: "Science" },
		{ label: "Commerce", value: "Commerce" },
		{ label: "Engineering", value: "Engineering" },
		{ label: "Medicine", value: "Medicine" },
		{ label: "Law", value: "Law" },
		{ label: "Others", value: "Others" },
	];

	// Course Type options
	const courseTypeOptions = [
		{ label: "UG", value: "UG" },
		{ label: "PG", value: "PG" },
		{ label: "Diploma", value: "Diploma" },
		{ label: "Certificate", value: "Certificate" },
		{ label: "Research", value: "Research" },
	];

	// Medium of Instruction options
	const mediumOptions = [
		{ label: "Tamil", value: "Tamil" },
		{ label: "English", value: "English" },
		{ label: "Hindi", value: "Hindi" },
		{ label: "Telugu", value: "Telugu" },
		{ label: "Malayalam", value: "Malayalam" },
		{ label: "Kannada", value: "Kannada" },
	];

	// Mode of Study options
	const modeOfStudyOptions = [
		{ label: "Regular", value: "Regular" },
		{ label: "Distance", value: "Distance" },
		{ label: "Part-time", value: "Part-time" },
		{ label: "Online", value: "Online" },
	];

	// Type of Admission options
	const admissionTypeOptions = [
		{ label: "Merit", value: "Merit" },
		{ label: "Management", value: "Management" },
		{ label: "Sports", value: "Sports" },
		{ label: "Special Category", value: "Special Category" },
		{ label: "Transfer", value: "Transfer" },
		{ label: "Others", value: "Others" },
	];

	// Year of Study options
	const yearOfStudyOptions = [
		{ label: "1st Year", value: "1" },
		{ label: "2nd Year", value: "2" },
		{ label: "3rd Year", value: "3" },
		{ label: "4th Year", value: "4" },
		{ label: "5th Year", value: "5" },
		{ label: "6th Year", value: "6" },
	];

	// Hostel Type options
	const hostelTypeOptions = [
		{ label: "Government Hostel", value: "Government" },
		{ label: "Private Hostel", value: "Private" },
		{ label: "College Hostel", value: "College" },
		{ label: "Others", value: "Others" },
	];

	// Save academic information to UMIS API
	const handleSaveAcademicInfo = async () => {
		if (!currentToken?.token) {
			setSaveResult({
				success: false,
				message: "Authentication required. Please login first.",
			});
			return;
		}

		setIsSaving(true);
		setSaveResult(null);

		try {
			// We need a student ID - this would typically come from the general info save
			// For now, using a placeholder value that would be passed from parent component
			const studentId = 6693300; // This should be dynamic

			// Transform form data to API payload
			const payload = transformAcademicInfoToPayload(formData, studentId);

			// Call the API
			const response = await umisApiService.saveStudentAcademicInfo(
				payload,
				currentToken.token,
			);

			if (response.isSuccess) {
				setSaveResult({
					success: true,
					message: `Academic information saved successfully! Academic ID: ${response.value}`,
				});
			} else {
				setSaveResult({
					success: false,
					message: response.message || "Failed to save academic information",
				});
			}
		} catch (error) {
			console.error("Error saving academic information:", error);
			setSaveResult({
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Failed to save academic information",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-8">
			<div className="text-center">
				<h3 className="text-xl font-semibold text-blue-600 mb-2">Current Academic Information</h3>
				<p className="text-gray-600 text-sm">Please provide details about your current academic enrollment</p>
			</div>

			{/* Academic Year and Stream Information */}
			<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
				<h4 className="text-lg font-semibold text-blue-800 mb-4">Academic Details</h4>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="academicYear">Academic Year *</Label>
						<Combobox
							options={academicYearOptions}
							value={formData.academicYear}
							onValueChange={(value) => updateFormData({ academicYear: value })}
							placeholder="Select Academic Year"
							searchPlaceholder="Search academic year..."
						/>
						{validationErrors.academicYear && (
							<p className="text-red-600 text-sm">{validationErrors.academicYear}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="streamType">Stream Type *</Label>
						<Combobox
							options={streamTypeOptions}
							value={formData.streamType}
							onValueChange={(value) => updateFormData({ streamType: value })}
							placeholder="Select Stream Type"
							searchPlaceholder="Search stream..."
						/>
						{validationErrors.streamType && (
							<p className="text-red-600 text-sm">{validationErrors.streamType}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="courseType">Course Type *</Label>
						<Combobox
							options={courseTypeOptions}
							value={formData.courseType}
							onValueChange={(value) => updateFormData({ courseType: value })}
							placeholder="Select Course Type"
							searchPlaceholder="Search course type..."
						/>
						{validationErrors.courseType && (
							<p className="text-red-600 text-sm">{validationErrors.courseType}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="course">Course *</Label>
						<Input
							id="course"
							value={formData.course}
							onChange={(e) => updateFormData({ course: e.target.value })}
							placeholder="Enter course name (e.g., B.E., B.Tech, M.A.)"
						/>
						{validationErrors.course && (
							<p className="text-red-600 text-sm">{validationErrors.course}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="branchSpecialization">Branch/Specialization *</Label>
						<Input
							id="branchSpecialization"
							value={formData.branchSpecialization}
							onChange={(e) => updateFormData({ branchSpecialization: e.target.value })}
							placeholder="Enter branch/specialization"
						/>
						{validationErrors.branchSpecialization && (
							<p className="text-red-600 text-sm">{validationErrors.branchSpecialization}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="yearOfStudy">Year of Study *</Label>
						<Combobox
							options={yearOfStudyOptions}
							value={formData.yearOfStudy}
							onValueChange={(value) => updateFormData({ yearOfStudy: value })}
							placeholder="Select Year of Study"
							searchPlaceholder="Search year..."
						/>
						{validationErrors.yearOfStudy && (
							<p className="text-red-600 text-sm">{validationErrors.yearOfStudy}</p>
						)}
					</div>
				</div>
			</div>

			{/* Study Mode and Medium */}
			<div className="bg-green-50 p-6 rounded-lg border border-green-200">
				<h4 className="text-lg font-semibold text-green-800 mb-4">Mode of Study</h4>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="mediumOfInstruction">Medium of Instruction *</Label>
						<Combobox
							options={mediumOptions}
							value={formData.mediumOfInstruction}
							onValueChange={(value) => updateFormData({ mediumOfInstruction: value })}
							placeholder="Select Medium"
							searchPlaceholder="Search medium..."
						/>
						{validationErrors.mediumOfInstruction && (
							<p className="text-red-600 text-sm">{validationErrors.mediumOfInstruction}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="modeOfStudy">Mode of Study *</Label>
						<Combobox
							options={modeOfStudyOptions}
							value={formData.modeOfStudy}
							onValueChange={(value) => updateFormData({ modeOfStudy: value })}
							placeholder="Select Mode of Study"
							searchPlaceholder="Search mode..."
						/>
						{validationErrors.modeOfStudy && (
							<p className="text-red-600 text-sm">{validationErrors.modeOfStudy}</p>
						)}
					</div>
				</div>
			</div>

			{/* Admission Information */}
			<div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
				<h4 className="text-lg font-semibold text-purple-800 mb-4">Admission Information</h4>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="dateOfAdmission">Date of Admission *</Label>
						<Input
							id="dateOfAdmission"
							type="date"
							value={formData.dateOfAdmission}
							onChange={(e) => updateFormData({ dateOfAdmission: e.target.value })}
						/>
						{validationErrors.dateOfAdmission && (
							<p className="text-red-600 text-sm">{validationErrors.dateOfAdmission}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="typeOfAdmission">Type of Admission</Label>
						<Combobox
							options={admissionTypeOptions}
							value={formData.typeOfAdmission}
							onValueChange={(value) => updateFormData({ typeOfAdmission: value })}
							placeholder="Select Type of Admission"
							searchPlaceholder="Search admission type..."
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="counselingNumber">Counseling Number</Label>
						<Input
							id="counselingNumber"
							value={formData.counselingNumber}
							onChange={(e) => updateFormData({ counselingNumber: e.target.value })}
							placeholder="Enter counseling number (if applicable)"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="registrationNumber">Registration Number</Label>
						<Input
							id="registrationNumber"
							value={formData.registrationNumber}
							onChange={(e) => updateFormData({ registrationNumber: e.target.value })}
							placeholder="Enter university registration number"
						/>
					</div>
				</div>

				{/* Lateral Entry */}
				<div className="mt-6 space-y-2">
					<Label>Is this a Lateral Entry? *</Label>
					<div className="flex gap-6">
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="isLateralEntry"
								value="yes"
								checked={formData.isLateralEntry === "yes"}
								onChange={(e) => updateFormData({ isLateralEntry: e.target.value as "yes" | "no" })}
								className="text-purple-600"
							/>
							<span className="text-sm">Yes</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="isLateralEntry"
								value="no"
								checked={formData.isLateralEntry === "no"}
								onChange={(e) => updateFormData({ isLateralEntry: e.target.value as "yes" | "no" })}
								className="text-purple-600"
							/>
							<span className="text-sm">No</span>
						</label>
					</div>
					{validationErrors.isLateralEntry && (
						<p className="text-red-600 text-sm">{validationErrors.isLateralEntry}</p>
					)}
				</div>
			</div>

			{/* Hostel Information */}
			<div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
				<h4 className="text-lg font-semibold text-orange-800 mb-4">Hostel Information</h4>
				
				<div className="space-y-6">
					{/* Hosteler Status */}
					<div className="space-y-2">
						<Label>Are you a Hosteler? *</Label>
						<div className="flex gap-6">
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="isHosteler"
									value="yes"
									checked={formData.isHosteler === "yes"}
									onChange={(e) => updateFormData({ isHosteler: e.target.value as "yes" | "no" })}
									className="text-orange-600"
								/>
								<span className="text-sm">Yes</span>
							</label>
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="isHosteler"
									value="no"
									checked={formData.isHosteler === "no"}
									onChange={(e) => updateFormData({ isHosteler: e.target.value as "yes" | "no" })}
									className="text-orange-600"
								/>
								<span className="text-sm">No</span>
							</label>
						</div>
						{validationErrors.isHosteler && (
							<p className="text-red-600 text-sm">{validationErrors.isHosteler}</p>
						)}
					</div>

					{/* Hostel Details - Conditional */}
					{formData.isHosteler === "yes" && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label htmlFor="hostelAdmissionDate">Hostel Admission Date</Label>
								<Input
									id="hostelAdmissionDate"
									type="date"
									value={formData.hostelAdmissionDate}
									onChange={(e) => updateFormData({ hostelAdmissionDate: e.target.value })}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="hostelLeavingDate">Hostel Leaving Date (if applicable)</Label>
								<Input
									id="hostelLeavingDate"
									type="date"
									value={formData.hostelLeavingDate}
									onChange={(e) => updateFormData({ hostelLeavingDate: e.target.value })}
								/>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="hostelType">Hostel Type</Label>
								<Combobox
									options={hostelTypeOptions}
									value={formData.hostelType}
									onValueChange={(value) => updateFormData({ hostelType: value })}
									placeholder="Select Hostel Type"
									searchPlaceholder="Search hostel type..."
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Important Notes */}
			<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
				<h5 className="font-medium text-gray-800 mb-2">📚 Academic Information Notes:</h5>
				<ul className="text-sm text-gray-700 space-y-1">
					<li>• Ensure all academic details match your official college records</li>
					<li>• Academic year should be the current year of study</li>
					<li>• Course and branch details should match your admission certificate</li>
					<li>• Hostel information is required for scholarship and accommodation purposes</li>
					<li>• All information will be verified with your institution</li>
				</ul>
			</div>

			{/* Save Button and Result */}
			<div className="space-y-4 pt-6 border-t border-gray-200">
				<div className="flex justify-center">
					<Button
						onClick={handleSaveAcademicInfo}
						disabled={isSaving || !currentToken?.token}
						className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
					>
						{isSaving ? "Saving..." : "Save Academic Information"}
					</Button>
				</div>

				{/* Save Result Display */}
				{saveResult && (
					<div
						className={`p-4 rounded-md ${
							saveResult.success
								? "bg-green-50 border border-green-200 text-green-800"
								: "bg-red-50 border border-red-200 text-red-800"
						}`}
					>
						<p className="text-sm font-medium">
							{saveResult.success ? "✅" : "❌"} {saveResult.message}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};