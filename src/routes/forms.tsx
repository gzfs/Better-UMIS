import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Shield, User } from "lucide-react";
import { useState } from "react";

import { UMISProtectedRoute } from "../components/UMISProtectedRoute";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Combobox } from "../components/ui/combobox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useTokenStore } from "../store/tokenStore";

const FormsPageContent = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8">
					<Button
						onClick={() => navigate({ to: "/dashboard" })}
						variant="ghost"
						className="mb-4 flex items-center gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Dashboard
					</Button>
					<h1 className="text-3xl font-bold text-gray-900">
						Forms & Registration
					</h1>
					<p className="text-gray-600">
						Complete forms and verify your information for UMIS services
					</p>
				</div>

				{/* EMIS ID Verification Form */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							EMIS ID Verification
						</CardTitle>
						<CardDescription>
							Verify your EMIS ID to register with the UMIS system
						</CardDescription>
					</CardHeader>
					<CardContent>
						<EMISVerificationForm />
					</CardContent>
				</Card>

				{/* Additional Forms Section */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Additional Forms
						</CardTitle>
						<CardDescription>
							More forms and registration options will be available here
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-center py-8 text-gray-500">
							<Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
							<p className="text-sm">
								Additional forms and registration options will be added here as
								needed.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export const FormsPage = () => {
	return (
		<UMISProtectedRoute>
			<FormsPageContent />
		</UMISProtectedRoute>
	);
};

export const Route = createFileRoute("/forms")({
	component: FormsPage,
});

// EMIS ID Verification Form Component
const EMISVerificationForm = () => {
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationResult, setVerificationResult] = useState<string | null>(
		null,
	);
	const [emisId, setEmisId] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);
	const [emisData, setEmisData] = useState<{
		value: {
			emsid: string;
			udiseCode: string;
			religion: string;
			pincode: string;
			mbl_Nmbr: string;
			parent_income: string;
			stuName: string;
			mother_occupation: string;
			mother_name: string;
			house_address: string;
			guardian_name: string;
			gender: string;
			father_occupation: string;
			father_name: string;
			dob: string;
			differently_abled: string;
			community: string;
			bloodgroup: string;
			aadhaarNumber: string;
			oldEMSID: string | null;
			last_passed_class: string;
			school_type: number;
			passed_year: string;
			tpEligible: boolean;
			tpSource: boolean;
			medium: string;
			group_name: string;
		};
		isSuccess: boolean;
		isFailure: boolean;
	} | null>(null);
	const [formData, setFormData] = useState({
		salutation: "",
		studentName: "",
		studentNameAadhaar: "",
		nationality: "",
		gender: "",
		bloodGroup: "",
		dob: "",
		religion: "",
		community: "",
		caste: "",
	});

	const [casteList, setCasteList] = useState<
		Array<{
			id: number;
			casteName: string;
			casteCode: string;
			communityId: number;
		}>
	>([]);
	const [isLoadingCaste, setIsLoadingCaste] = useState(false);
	const { currentToken } = useTokenStore();

	// Community options with their corresponding numbers
	const communityOptions = [
		{ label: "BC", value: "11" },
		{ label: "BC Muslim", value: "10" },
		{ label: "DNC/DNT", value: "13" },
		{ label: "MBC", value: "3" },
		{ label: "NOT APPLICABLE", value: "1" },
		{ label: "Not Stated", value: "14" },
		{ label: "OC", value: "6" },
		{ label: "SC", value: "12" },
		{ label: "SC Arunthathiyar", value: "7" },
		{ label: "ST", value: "4" },
	];

	// Fetch caste list based on selected community
	const fetchCasteList = async (communityNumber: string) => {
		if (!communityNumber || !currentToken?.token) return;

		setIsLoadingCaste(true);
		try {
			const response = await fetch(
				`https://umisapi.tnega.org/api/community/casteList/${communityNumber}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${currentToken.token}`,
					},
				},
			);

			if (response.ok) {
				const data = await response.json();
				setCasteList(data);
			} else {
				console.error("Failed to fetch caste list:", response.status);
				setCasteList([]);
			}
		} catch (error) {
			console.error("Error fetching caste list:", error);
			setCasteList([]);
		} finally {
			setIsLoadingCaste(false);
		}
	};

	// Handle community change
	const handleCommunityChange = (value: string) => {
		handleFormFieldChange("community", value);
		// Reset caste when community changes
		handleFormFieldChange("caste", "");
		// Fetch new caste list
		fetchCasteList(value);
	};

	// Validate EMIS ID format (16 digits)
	const validateEmisId = (id: string): boolean => {
		const emisIdRegex = /^\d{16}$/;
		return emisIdRegex.test(id);
	};

	const handleEmisIdChange = (value: string) => {
		// Only allow digits
		const digitsOnly = value.replace(/\D/g, "");

		// Limit to 16 digits
		const truncated = digitsOnly.slice(0, 16);

		setEmisId(truncated);

		// Clear validation error when user types
		if (validationError) {
			setValidationError(null);
		}

		// Clear verification result when user changes input
		if (verificationResult) {
			setVerificationResult(null);
		}

		// Clear EMIS data when input changes
		if (emisData) {
			setEmisData(null);
		}
	};

	const handleFormFieldChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const populateFormFromEmisData = (data: {
		value: {
			stuName: string;
			gender: string;
			bloodgroup: string;
			dob: string;
			religion: string;
			community: string;
		};
	}) => {
		// Extract relevant data from EMIS response and populate form
		setFormData((prev) => ({
			...prev,
			studentName: data.value.stuName || "",
			// Map EMIS data to form fields
			gender:
				data.value.gender === "Boy"
					? "male"
					: data.value.gender === "Girl"
						? "female"
						: "third gender",
			bloodGroup: data.value.bloodgroup || "",
			dob: data.value.dob || "",
			religion: data.value.religion || "",
			community: data.value.community || "",
		}));

		// If community is available, fetch the caste list
		if (data.value.community) {
			// Map community name to number for API call
			const communityMapping: Record<string, string> = {
				"BC-Others": "11",
				"BC Muslim": "10",
				"DNC/DNT": "13",
				MBC: "3",
				"NOT APPLICABLE": "1",
				"Not Stated": "14",
				OC: "6",
				SC: "12",
				"SC Arunthathiyar": "7",
				ST: "4",
			};

			const communityNumber = communityMapping[data.value.community];
			if (communityNumber) {
				fetchCasteList(communityNumber);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!emisId.trim()) {
			setValidationError("EMIS ID is required");
			return;
		}

		// Validate EMIS ID format
		if (!validateEmisId(emisId)) {
			setValidationError(
				"EMIS ID must be exactly 16 digits (e.g., 3302100091600216)",
			);
			return;
		}

		// Check if user is authenticated
		if (!currentToken?.token) {
			setVerificationResult(
				"❌ Error: You must be authenticated to verify EMIS ID. Please login first.",
			);
			return;
		}

		// Clear any previous validation errors
		setValidationError(null);

		setIsVerifying(true);
		setVerificationResult(null);

		try {
			const response = await fetch(
				`https://umisapi.tnega.org/api/student/emis/${emisId}/0`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${currentToken.token}`,
					},
				},
			);

			console.log(response);

			if (response.ok) {
				const data = await response.json();
				setEmisData(data);
				populateFormFromEmisData(data);
				setVerificationResult(
					"✅ EMIS ID verified successfully! Please complete the form below.",
				);
			} else {
				setVerificationResult(
					`Verification failed: ${response.status} ${response.statusText}`,
				);
			}
		} catch (error) {
			setVerificationResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
			);
		} finally {
			setIsVerifying(false);
		}
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate required fields
		const requiredFields = [
			"salutation",
			"studentNameAadhaar",
			"nationality",
			"gender",
			"bloodGroup",
			"dob",
			"religion",
			"community",
			"caste",
		];
		const missingFields = requiredFields.filter(
			(field) => !formData[field as keyof typeof formData],
		);

		if (missingFields.length > 0) {
			setValidationError(
				`Please fill in all required fields: ${missingFields.join(", ")}`,
			);
			return;
		}

		// Here you would submit the form data to your backend
		console.log("Form data to submit:", { emisId, ...formData });
		setVerificationResult(
			"✅ Form submitted successfully! (This is a demo - data would be sent to backend)",
		);
	};

	return (
		<div className="space-y-6">
			{/* Authentication Status */}
			{!currentToken?.token && (
				<div className="p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
					<p className="text-sm font-medium">⚠️ Authentication Required</p>
					<p className="text-xs mt-1">
						You must be authenticated with a valid UMIS token to verify EMIS
						IDs.
					</p>
				</div>
			)}

			{/* EMIS ID Format Info */}
			<div className="p-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
				<p className="text-sm font-medium">ℹ️ EMIS ID Format</p>
				<p className="text-xs mt-1">
					EMIS ID must be exactly 16 digits (e.g., 3302100091600216)
				</p>
			</div>

			{/* EMIS ID Verification Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Step 1: Verify EMIS ID</CardTitle>
					<CardDescription>
						Enter your EMIS ID to verify and fetch student information
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="emisId">EMIS ID</Label>
							<div className="flex gap-2">
								<Input
									id="emisId"
									placeholder="3302100091600216"
									value={emisId}
									onChange={(e) => handleEmisIdChange(e.target.value)}
									className="flex-1 font-mono text-sm"
									disabled={!currentToken?.token}
									maxLength={16}
								/>
								<Button
									type="submit"
									disabled={
										isVerifying || !emisId.trim() || !currentToken?.token
									}
									className="px-6"
								>
									{isVerifying ? "Verifying..." : "Verify"}
								</Button>
							</div>

							{/* Validation Error */}
							{validationError && (
								<p className="text-sm text-red-600">{validationError}</p>
							)}

							{/* Character Count */}
							<p className="text-xs text-gray-500">{emisId.length}/16 digits</p>
						</div>
					</form>

					{verificationResult && (
						<div
							className={`p-4 rounded-md ${
								verificationResult.includes("successful") ||
								verificationResult.includes("✅")
									? "bg-green-50 border border-green-200 text-green-800"
									: "bg-red-50 border border-red-200 text-red-800"
							}`}
						>
							<p className="text-sm font-medium">{verificationResult}</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Student Registration Form */}
			{emisData && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">
							Step 2: Complete Student Registration
						</CardTitle>
						<CardDescription>
							Fill in the student details below. Fields marked with * are
							required.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* EMIS Data Display */}
						<div className="mb-6 p-4 bg-gray-50 rounded-lg">
							<h4 className="font-medium text-gray-900 mb-3">
								Information from EMIS
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
								<div>
									<span className="font-medium text-gray-700">EMIS ID:</span>
									<span className="ml-2 text-gray-600">
										{emisData.value.emsid}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">UDISE Code:</span>
									<span className="ml-2 text-gray-600">
										{emisData.value.udiseCode}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">
										Father's Name:
									</span>
									<span className="ml-2 text-gray-600">
										{emisData.value.father_name}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">
										Mother's Name:
									</span>
									<span className="ml-2 text-gray-600">
										{emisData.value.mother_name}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">Address:</span>
									<span className="ml-2 text-gray-600">
										{emisData.value.house_address}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">Pincode:</span>
									<span className="ml-2 text-gray-600">
										{emisData.value.pincode}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">Mobile:</span>
									<span className="ml-2 text-gray-600">
										{emisData.value.mbl_Nmbr}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">Community:</span>
									<span className="ml-2 text-gray-600">
										{emisData.value.community}
									</span>
								</div>
							</div>
						</div>

						<form onSubmit={handleFormSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Salutation */}
								<div className="space-y-2">
									<Label htmlFor="salutation">Salutation *</Label>
									<Combobox
										options={[
											{ label: "Selvan", value: "Selvan" },
											{ label: "Selvi", value: "Selvi" },
											{ label: "Thiru", value: "Thiru" },
											{ label: "Thirumathi", value: "Thirumathi" },
										]}
										value={formData.salutation}
										onValueChange={(value) =>
											handleFormFieldChange("salutation", value)
										}
										placeholder="Select Salutation"
										searchPlaceholder="Search salutation..."
									/>
								</div>

								{/* Student Name (from EMIS) */}
								<div className="space-y-2">
									<Label htmlFor="studentName">Student Name (from EMIS)</Label>
									<Input
										id="studentName"
										value={formData.studentName}
										className="bg-gray-50"
										readOnly
									/>
								</div>

								{/* Student Name (As on Aadhaar) */}
								<div className="space-y-2">
									<Label htmlFor="studentNameAadhaar">
										Student Name (As on Aadhaar) *
									</Label>
									<Input
										id="studentNameAadhaar"
										value={formData.studentNameAadhaar}
										onChange={(e) =>
											handleFormFieldChange(
												"studentNameAadhaar",
												e.target.value,
											)
										}
										placeholder="Enter name as on Aadhaar"
										required
									/>
								</div>

								{/* Nationality */}
								<div className="space-y-2">
									<Label htmlFor="nationality">Nationality *</Label>
									<Combobox
										options={[
											{ label: "Indian", value: "Indian" },
											{ label: "Others", value: "Others" },
										]}
										value={formData.nationality}
										onValueChange={(value) =>
											handleFormFieldChange("nationality", value)
										}
										placeholder="Select Nationality"
										searchPlaceholder="Search nationality..."
									/>
								</div>

								{/* Gender */}
								<div className="space-y-2">
									<Label>Gender *</Label>
									<div className="space-y-2">
										<label className="flex items-center space-x-2">
											<input
												type="radio"
												name="gender"
												value="male"
												checked={formData.gender === "male"}
												onChange={(e) =>
													handleFormFieldChange("gender", e.target.value)
												}
												className="text-blue-600"
												required
											/>
											<span className="text-sm">Male</span>
										</label>
										<label className="flex items-center space-x-2">
											<input
												type="radio"
												name="gender"
												value="female"
												checked={formData.gender === "female"}
												onChange={(e) =>
													handleFormFieldChange("gender", e.target.value)
												}
												className="text-blue-600"
												required
											/>
											<span className="text-sm">Female</span>
										</label>
										<label className="flex items-center space-x-2">
											<input
												type="radio"
												name="gender"
												value="third gender"
												checked={formData.gender === "third gender"}
												onChange={(e) =>
													handleFormFieldChange("gender", e.target.value)
												}
												className="text-blue-600"
												required
											/>
											<span className="text-sm">Third Gender</span>
										</label>
									</div>
								</div>

								{/* Blood Group */}
								<div className="space-y-2">
									<Label htmlFor="bloodGroup">Blood Group *</Label>
									<Combobox
										options={[
											{ label: "A+", value: "A+" },
											{ label: "A-", value: "A-" },
											{ label: "B+", value: "B+" },
											{ label: "B-", value: "B-" },
											{ label: "AB+", value: "AB+" },
											{ label: "AB-", value: "AB-" },
											{ label: "O+", value: "O+" },
											{ label: "O-", value: "O-" },
										]}
										value={formData.bloodGroup}
										onValueChange={(value) =>
											handleFormFieldChange("bloodGroup", value)
										}
										placeholder="Select Blood Group"
										searchPlaceholder="Search blood group..."
									/>
								</div>

								{/* Date of Birth */}
								<div className="space-y-2">
									<Label htmlFor="dob">Date of Birth *</Label>
									<Input
										id="dob"
										type="date"
										value={formData.dob}
										onChange={(e) =>
											handleFormFieldChange("dob", e.target.value)
										}
										required
									/>
								</div>

								{/* Religion */}
								<div className="space-y-2">
									<Label htmlFor="religion">Religion *</Label>
									<Combobox
										options={[
											{ label: "Buddhism", value: "Buddhism" },
											{ label: "Christian", value: "Christian" },
											{ label: "Hindu", value: "Hindu" },
											{ label: "Jainism", value: "Jainism" },
											{ label: "Muslim", value: "Muslim" },
											{ label: "Not Applicable", value: "Not Applicable" },
											{
												label: "Religion not disclosed",
												value: "Religion not disclosed",
											},
											{ label: "Sikh", value: "Sikh" },
										]}
										value={formData.religion}
										onValueChange={(value) =>
											handleFormFieldChange("religion", value)
										}
										placeholder="Select Religion"
										searchPlaceholder="Search religion..."
									/>
								</div>

								{/* Community */}
								<div className="space-y-2">
									<Label htmlFor="community">Community *</Label>
									<Combobox
										options={communityOptions}
										value={formData.community}
										onValueChange={handleCommunityChange}
										placeholder="Select Community"
										searchPlaceholder="Search community..."
									/>
								</div>

								{/* Caste */}
								<div className="space-y-2">
									<Label htmlFor="caste">Caste *</Label>
									<Combobox
										options={casteList.map((caste) => ({
											label: caste.casteName,
											value: caste.casteName,
										}))}
										value={formData.caste}
										onValueChange={(value) =>
											handleFormFieldChange("caste", value)
										}
										placeholder={isLoadingCaste ? "Loading..." : "Select Caste"}
										searchPlaceholder="Search caste..."
										emptyText={
											casteList.length === 0
												? "No caste found for this community."
												: "No results found."
										}
										disabled={isLoadingCaste || casteList.length === 0}
									/>
								</div>
							</div>

							{/* Submit Button */}
							<div className="pt-4">
								<Button
									type="submit"
									className="w-full md:w-auto px-8"
									disabled={!emisData}
								>
									Submit Registration
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
