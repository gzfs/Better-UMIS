import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Combobox } from "../ui/combobox";
import type { StudentFormData } from "../StudentRegistrationWizard";
import type { TokenInfo } from "../../store/tokenStore";

interface GeneralInformationTabProps {
	formData: StudentFormData;
	updateFormData: (updates: Partial<StudentFormData>) => void;
	validationErrors: Record<string, string>;
	currentToken: TokenInfo | null;
}

export const GeneralInformationTab = ({
	formData,
	updateFormData,
	validationErrors,
	currentToken,
}: GeneralInformationTabProps) => {
	const [casteList, setCasteList] = useState<Array<{
		id: number;
		casteName: string;
		casteCode: string;
		communityId: number;
	}>>([]);
	const [isLoadingCaste, setIsLoadingCaste] = useState(false);
	const [otpSent, setOtpSent] = useState(false);

	// Community options matching UMIS
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

	// Salutation options
	const salutationOptions = [
		{ label: "Selvan", value: "Selvan" },
		{ label: "Selvi", value: "Selvi" },
		{ label: "Thiru", value: "Thiru" },
		{ label: "Thirumathi", value: "Thirumathi" },
	];

	// Nationality options
	const nationalityOptions = [
		{ label: "Indian", value: "Indian" },
		{ label: "Others", value: "Others" },
	];

	// Blood Group options
	const bloodGroupOptions = [
		{ label: "A+", value: "A+" },
		{ label: "A-", value: "A-" },
		{ label: "B+", value: "B+" },
		{ label: "B-", value: "B-" },
		{ label: "AB+", value: "AB+" },
		{ label: "AB-", value: "AB-" },
		{ label: "O+", value: "O+" },
		{ label: "O-", value: "O-" },
	];

	// Religion options
	const religionOptions = [
		{ label: "Buddhism", value: "Buddhism" },
		{ label: "Christian", value: "Christian" },
		{ label: "Hindu", value: "Hindu" },
		{ label: "Jainism", value: "Jainism" },
		{ label: "Muslim", value: "Muslim" },
		{ label: "Not Applicable", value: "Not Applicable" },
		{ label: "Religion not disclosed", value: "Religion not disclosed" },
		{ label: "Sikh", value: "Sikh" },
	];

	// State options (you might want to load these from API)
	const stateOptions = [
		{ label: "Tamil Nadu", value: "Tamil Nadu" },
		{ label: "Andhra Pradesh", value: "Andhra Pradesh" },
		{ label: "Karnataka", value: "Karnataka" },
		{ label: "Kerala", value: "Kerala" },
		{ label: "Telangana", value: "Telangana" },
		// Add more states as needed
	];

	// EMIS Unavailable Reason options
	const emisUnavailableReasons = [
		{ label: "Student not studied in Tamil Nadu", value: "not_tn_student" },
		{ label: "EMIS not available during study period", value: "emis_not_available" },
		{ label: "Private institution not under EMIS", value: "private_institution" },
		{ label: "Other reasons", value: "other" },
	];

	// Fetch caste list based on community
	const fetchCasteList = async (communityNumber: string) => {
		if (!communityNumber || !currentToken?.token) return;

		setIsLoadingCaste(true);
		try {
			const response = await fetch(
				`/umis-api/api/community/casteList/${communityNumber}`,
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
		updateFormData({ community: value, caste: "" });
		fetchCasteList(value);
	};

	// Handle Aadhaar OTP
	const handleSendOTP = async () => {
		if (!formData.aadhaarNumber || !currentToken?.token) return;

		try {
			const response = await fetch(
				"/umis-api/api/aadhaar/sendOTP",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${currentToken.token}`,
					},
					body: JSON.stringify({
						aadhaarNumber: formData.aadhaarNumber,
					}),
				},
			);

			if (response.ok) {
				const data = await response.json();
				setOtpSent(true);
				console.log("OTP sent successfully:", data);
			} else {
				const errorData = await response.json();
				console.error("Failed to send OTP:", errorData);
				alert(`Failed to send OTP: ${errorData.message || "Please try again"}`);
			}
		} catch (error) {
			console.error("Error sending OTP:", error);
			alert("Network error occurred while sending OTP. Please try again.");
		}
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h3 className="text-xl font-semibold text-blue-600 mb-2">General Information</h3>
				<p className="text-gray-600 text-sm">Please provide your basic information below</p>
			</div>

			{/* EMIS ID Availability */}
			<div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
				<Label className="text-base font-medium text-blue-800 mb-3 block">
					Is EMIS ID Available? *
				</Label>
				<div className="flex gap-6">
					<label className="flex items-center space-x-2">
						<input
							type="radio"
							name="emisAvailable"
							value="yes"
							checked={formData.emisAvailable === "yes"}
							onChange={(e) => updateFormData({ 
								emisAvailable: e.target.value as "yes" | "no",
								emisUnavailableReason: "" 
							})}
							className="text-blue-600"
						/>
						<span className="text-sm font-medium">Yes</span>
					</label>
					<label className="flex items-center space-x-2">
						<input
							type="radio"
							name="emisAvailable"
							value="no"
							checked={formData.emisAvailable === "no"}
							onChange={(e) => updateFormData({ 
								emisAvailable: e.target.value as "yes" | "no" 
							})}
							className="text-blue-600"
						/>
						<span className="text-sm font-medium">No</span>
					</label>
				</div>
				{validationErrors.emisAvailable && (
					<p className="text-red-600 text-sm mt-1">{validationErrors.emisAvailable}</p>
				)}
			</div>

			{/* Reason for EMIS unavailability - Conditional */}
			{formData.emisAvailable === "no" && (
				<div className="space-y-2">
					<Label htmlFor="emisUnavailableReason">Reason for unavailability of EMIS-ID? *</Label>
					<Combobox
						options={emisUnavailableReasons}
						value={formData.emisUnavailableReason}
						onValueChange={(value) => updateFormData({ emisUnavailableReason: value })}
						placeholder="Select reason"
						searchPlaceholder="Search reason..."
					/>
					{validationErrors.emisUnavailableReason && (
						<p className="text-red-600 text-sm">{validationErrors.emisUnavailableReason}</p>
					)}
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Salutation */}
				<div className="space-y-2">
					<Label htmlFor="salutation">Salutation *</Label>
					<Combobox
						options={salutationOptions}
						value={formData.salutation}
						onValueChange={(value) => updateFormData({ salutation: value })}
						placeholder="Select Salutation"
						searchPlaceholder="Search salutation..."
					/>
					{validationErrors.salutation && (
						<p className="text-red-600 text-sm">{validationErrors.salutation}</p>
					)}
				</div>

				{/* Student Name (As on Certificate) */}
				<div className="space-y-2">
					<Label htmlFor="studentNameCertificate">Student Name (As on Certificate) *</Label>
					<Input
						id="studentNameCertificate"
						value={formData.studentNameCertificate}
						onChange={(e) => updateFormData({ studentNameCertificate: e.target.value })}
						placeholder="Enter name as on certificate"
					/>
					{validationErrors.studentNameCertificate && (
						<p className="text-red-600 text-sm">{validationErrors.studentNameCertificate}</p>
					)}
				</div>

				{/* Student Name (As on Aadhaar) */}
				<div className="space-y-2">
					<Label htmlFor="studentNameAadhaar">Student Name (As on Aadhaar) *</Label>
					<Input
						id="studentNameAadhaar"
						value={formData.studentNameAadhaar}
						onChange={(e) => updateFormData({ studentNameAadhaar: e.target.value })}
						placeholder="Enter name as on Aadhaar"
					/>
					{validationErrors.studentNameAadhaar && (
						<p className="text-red-600 text-sm">{validationErrors.studentNameAadhaar}</p>
					)}
				</div>

				{/* Nationality */}
				<div className="space-y-2">
					<Label htmlFor="nationality">Nationality *</Label>
					<Combobox
						options={nationalityOptions}
						value={formData.nationality}
						onValueChange={(value) => updateFormData({ nationality: value })}
						placeholder="Select Nationality"
						searchPlaceholder="Search nationality..."
					/>
					{validationErrors.nationality && (
						<p className="text-red-600 text-sm">{validationErrors.nationality}</p>
					)}
				</div>

				{/* State Name */}
				<div className="space-y-2">
					<Label htmlFor="stateName">State Name *</Label>
					<Combobox
						options={stateOptions}
						value={formData.stateName}
						onValueChange={(value) => updateFormData({ stateName: value })}
						placeholder="Select State"
						searchPlaceholder="Search state..."
					/>
					{validationErrors.stateName && (
						<p className="text-red-600 text-sm">{validationErrors.stateName}</p>
					)}
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
								onChange={(e) => updateFormData({ gender: e.target.value as "male" | "female" | "third_gender" })}
								className="text-blue-600"
							/>
							<span className="text-sm">Male</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="gender"
								value="female"
								checked={formData.gender === "female"}
								onChange={(e) => updateFormData({ gender: e.target.value as "male" | "female" | "third_gender" })}
								className="text-blue-600"
							/>
							<span className="text-sm">Female</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="gender"
								value="third_gender"
								checked={formData.gender === "third_gender"}
								onChange={(e) => updateFormData({ gender: e.target.value as "male" | "female" | "third_gender" })}
								className="text-blue-600"
							/>
							<span className="text-sm">Third Gender</span>
						</label>
					</div>
					{validationErrors.gender && (
						<p className="text-red-600 text-sm">{validationErrors.gender}</p>
					)}
				</div>

				{/* Blood Group */}
				<div className="space-y-2">
					<Label htmlFor="bloodGroup">Blood Group *</Label>
					<Combobox
						options={bloodGroupOptions}
						value={formData.bloodGroup}
						onValueChange={(value) => updateFormData({ bloodGroup: value })}
						placeholder="Select Blood Group"
						searchPlaceholder="Search blood group..."
					/>
					{validationErrors.bloodGroup && (
						<p className="text-red-600 text-sm">{validationErrors.bloodGroup}</p>
					)}
				</div>

				{/* Student Date of Birth */}
				<div className="space-y-2">
					<Label htmlFor="dateOfBirth">Student Date of Birth *</Label>
					<Input
						id="dateOfBirth"
						type="date"
						value={formData.dateOfBirth}
						onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
					/>
					{validationErrors.dateOfBirth && (
						<p className="text-red-600 text-sm">{validationErrors.dateOfBirth}</p>
					)}
				</div>

				{/* Religion */}
				<div className="space-y-2">
					<Label htmlFor="religion">Religion *</Label>
					<Combobox
						options={religionOptions}
						value={formData.religion}
						onValueChange={(value) => updateFormData({ religion: value })}
						placeholder="Select Religion"
						searchPlaceholder="Search religion..."
					/>
					{validationErrors.religion && (
						<p className="text-red-600 text-sm">{validationErrors.religion}</p>
					)}
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
					{validationErrors.community && (
						<p className="text-red-600 text-sm">{validationErrors.community}</p>
					)}
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
						onValueChange={(value) => updateFormData({ caste: value })}
						placeholder={isLoadingCaste ? "Loading..." : "Select Caste"}
						searchPlaceholder="Search caste..."
						emptyText={
							casteList.length === 0
								? "No caste found for this community."
								: "No results found."
						}
						disabled={isLoadingCaste || casteList.length === 0}
					/>
					{validationErrors.caste && (
						<p className="text-red-600 text-sm">{validationErrors.caste}</p>
					)}
				</div>

				{/* Community Certificate Number */}
				<div className="space-y-2">
					<Label htmlFor="communityCertificateNumber">Community Certificate Number *</Label>
					<Input
						id="communityCertificateNumber"
						value={formData.communityCertificateNumber}
						onChange={(e) => updateFormData({ communityCertificateNumber: e.target.value })}
						placeholder="Enter community certificate number"
					/>
					{validationErrors.communityCertificateNumber && (
						<p className="text-red-600 text-sm">{validationErrors.communityCertificateNumber}</p>
					)}
				</div>
			</div>

			{/* Aadhaar Number with OTP */}
			<div className="space-y-2">
				<Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
				<div className="flex gap-2">
					<Input
						id="aadhaarNumber"
						value={formData.aadhaarNumber}
						onChange={(e) => updateFormData({ aadhaarNumber: e.target.value })}
						placeholder="Ex (format): XXXX YYYY ZZZZ"
						maxLength={12}
						className="flex-1"
					/>
					<Button
						type="button"
						onClick={handleSendOTP}
						disabled={!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12}
						className="bg-green-600 hover:bg-green-700"
					>
						Send OTP
					</Button>
				</div>
				{validationErrors.aadhaarNumber && (
					<p className="text-red-600 text-sm">{validationErrors.aadhaarNumber}</p>
				)}
				{otpSent && (
					<p className="text-green-600 text-sm">OTP sent successfully to your registered mobile number</p>
				)}
			</div>

			{/* Additional Questions */}
			<div className="space-y-6">
				{/* First Graduate */}
				<div className="space-y-2">
					<Label>Is the student the first graduate in the family? *</Label>
					<div className="flex gap-6">
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="firstGraduate"
								value="yes"
								checked={formData.firstGraduate === "yes"}
								onChange={(e) => updateFormData({ firstGraduate: e.target.value as "yes" | "no" | "not_applicable" })}
								className="text-blue-600"
							/>
							<span className="text-sm">Yes</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="firstGraduate"
								value="no"
								checked={formData.firstGraduate === "no"}
								onChange={(e) => updateFormData({ firstGraduate: e.target.value as "yes" | "no" | "not_applicable" })}
								className="text-blue-600"
							/>
							<span className="text-sm">No</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="firstGraduate"
								value="not_applicable"
								checked={formData.firstGraduate === "not_applicable"}
								onChange={(e) => updateFormData({ firstGraduate: e.target.value as "yes" | "no" | "not_applicable" })}
								className="text-blue-600"
							/>
							<span className="text-sm">Not Applicable</span>
						</label>
					</div>
					{validationErrors.firstGraduate && (
						<p className="text-red-600 text-sm">{validationErrors.firstGraduate}</p>
					)}
				</div>

				{/* Special Quota */}
				<div className="space-y-2">
					<Label>Did you come under any special admission Quota? *</Label>
					<div className="flex gap-6">
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="specialQuota"
								value="yes"
								checked={formData.specialQuota === "yes"}
								onChange={(e) => updateFormData({ specialQuota: e.target.value as "yes" | "no" })}
								className="text-blue-600"
							/>
							<span className="text-sm">Yes</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="specialQuota"
								value="no"
								checked={formData.specialQuota === "no"}
								onChange={(e) => updateFormData({ specialQuota: e.target.value as "yes" | "no" })}
								className="text-blue-600"
							/>
							<span className="text-sm">No</span>
						</label>
					</div>
					{validationErrors.specialQuota && (
						<p className="text-red-600 text-sm">{validationErrors.specialQuota}</p>
					)}
				</div>

				{/* Differently Abled */}
				<div className="space-y-2">
					<Label>Did you belong to differently abled category? *</Label>
					<div className="flex gap-6">
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="differentlyAbled"
								value="yes"
								checked={formData.differentlyAbled === "yes"}
								onChange={(e) => updateFormData({ differentlyAbled: e.target.value as "yes" | "no" })}
								className="text-blue-600"
							/>
							<span className="text-sm">Yes</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="differentlyAbled"
								value="no"
								checked={formData.differentlyAbled === "no"}
								onChange={(e) => updateFormData({ differentlyAbled: e.target.value as "yes" | "no" })}
								className="text-blue-600"
							/>
							<span className="text-sm">No</span>
						</label>
					</div>
					{validationErrors.differentlyAbled && (
						<p className="text-red-600 text-sm">{validationErrors.differentlyAbled}</p>
					)}
				</div>
			</div>
		</div>
	);
};