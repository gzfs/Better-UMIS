import forge from "node-forge";
import { useEffect, useState } from "react";
import type { UmisTokensRecord } from "../../lib/xata.codegen";
import type { StudentFormData } from "../StudentRegistrationWizard";
import { Button } from "../ui/button";
import { Combobox } from "../ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface EmisData {
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
}

interface GeneralInformationTabProps {
	formData: StudentFormData;
	updateFormData: (updates: Partial<StudentFormData>) => void;
	validationErrors: Record<string, string>;
	currentToken: UmisTokensRecord | null;
}

export const GeneralInformationTab = ({
	formData,
	updateFormData,
	validationErrors,
	currentToken,
}: GeneralInformationTabProps) => {
	const [casteList, setCasteList] = useState<
		Array<{
			id: number;
			casteName: string;
			casteCode: string;
			communityId: number;
		}>
	>([]);
	const [isLoadingCaste, setIsLoadingCaste] = useState(false);

	const [emisId, setEmisId] = useState("");
	const [isVerifyingEmis, setIsVerifyingEmis] = useState(false);
	const [emisData, setEmisData] = useState<EmisData | null>(null);
	const [emisVerificationResult, setEmisVerificationResult] = useState<
		string | null
	>(null);
	const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
	const [otp, setOtp] = useState("");
	const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
	const [otpError, setOtpError] = useState<string | null>(null);
	const [transactionId, setTransactionId] = useState<string | null>(null);
	const [kycData, setKycData] = useState<{
		name: string;
		dob: string;
		gender: string;
		street: string;
		house: string;
		landMark: string;
		village: string;
		district: string;
		state: string;
		country: string;
		pinCode: string;
		location: string;
		photoBase64String: string;
	} | null>(null);

	// Public key for RSA encryption
	const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQB4vticl4+Wxvhi39+YL+Ui
vwPHnD+OnzjniUb+U1qeY8VnCvGXjZsZzSq6P3vNPIpnPtlP0xUTeIsOvFzDa8W5
OuV3YIwPChPSA71Ng4+j1BqR8tNTpXNljAyk4HFvhS8TOX/vJ3WletwidzY3SNG1
pYkh1S5rlWHlin42O+uO7k2HG8Sup5hSGz2om3beNVoFHYLchLt+E5YhUGmUj5u1
yB+tpboqGZkWSp+W394BwlJdq6Uoo9GGRUYRfSYgxoHKSjOaEvtmxaEsB7nehOP7
Hj5N7em8bHsLQrtdC4xfkGzJMnR3nCuU80qIH1dcDtK3IfqfSD8wbTUyYlgdKrld
AgMBAAE=
-----END PUBLIC KEY-----`;

	function encryptAadhaar(aadhaarNo: string): string {
		try {
			const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY_PEM);
			const encrypted = publicKey.encrypt(aadhaarNo, "RSAES-PKCS1-V1_5");
			return forge.util.encode64(encrypted);
		} catch (error) {
			console.error("Encryption error:", error);
			throw new Error("Failed to encrypt Aadhaar number");
		}
	}

	async function sendAadhaarOTP(aadhaarNo: string, token: string) {
		try {
			const encryptedAadhaar = encryptAadhaar(aadhaarNo);
			const response = await fetch(
				"https://umisapi.tnega.org/api/aadhaarverification/generateotp",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						studentId: 0,
						aadhaarNo: encryptedAadhaar,
						isResend: false,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`Failed to send OTP: ${response.statusText}`);
			}

			const data = await response.json();
			if (!data.status) {
				throw new Error(data.message || "Failed to send OTP");
			}

			return data.transactionId;
		} catch (error) {
			console.error("Failed to send OTP:", error);
			throw error;
		}
	}

	async function verifyAadhaarOTP(
		aadhaarNo: string,
		otp: string,
		transactionId: string,
		token: string,
	) {
		try {
			const encryptedAadhaar = encryptAadhaar(aadhaarNo);
			const encryptedOtp = encryptAadhaar(otp);

			const response = await fetch(
				"https://umisapi.tnega.org/api/aadhaarVerification/doKycWithOtp",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						studentId: 0,
						aadhaarNo: encryptedAadhaar,
						transactionId,
						otpValue: encryptedOtp,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`Failed to verify OTP: ${response.statusText}`);
			}

			const data = await response.json();
			if (!data.isSuccess || data.isFailure) {
				throw new Error(data.message || "Failed to verify OTP");
			}

			return data.value;
		} catch (error) {
			console.error("Failed to verify OTP:", error);
			throw error;
		}
	}

	const handleVerifyAadhaar = async () => {
		if (!formData.aadhaarNumber || !currentToken?.token) return;

		try {
			const transId = await sendAadhaarOTP(
				formData.aadhaarNumber,
				currentToken.token,
			);
			setTransactionId(transId);
			setIsOtpDialogOpen(true);
		} catch (error) {
			console.error("Failed to send OTP:", error);
			if (error instanceof Error) {
				setOtpError(error.message);
			} else {
				setOtpError("Failed to send OTP. Please try again.");
			}
		}
	};

	const handleVerifyOtp = async () => {
		if (
			!otp ||
			!currentToken?.token ||
			!transactionId ||
			!formData.aadhaarNumber
		)
			return;

		setIsVerifyingOtp(true);
		setOtpError(null);

		try {
			const kycResult = await verifyAadhaarOTP(
				formData.aadhaarNumber,
				otp,
				transactionId,
				currentToken.token,
			);

			setKycData(kycResult);
			setIsOtpDialogOpen(false);
			setOtp("");

			// Update form data with KYC details
			updateFormData({
				studentNameAadhaar: kycResult.name,
				gender:
					kycResult.gender === "M"
						? "male"
						: kycResult.gender === "F"
							? "female"
							: "third_gender",
				dateOfBirth: kycResult.dob.split("-").reverse().join("-"), // Convert DD-MM-YYYY to YYYY-MM-DD
			});
		} catch (error) {
			console.error("Failed to verify OTP:", error);
			if (error instanceof Error) {
				setOtpError(error.message);
			} else {
				setOtpError("Failed to verify OTP. Please try again.");
			}
		} finally {
			setIsVerifyingOtp(false);
		}
	};

	// Fetch EMIS reasons when component mounts or token changes
	useEffect(() => {
		if (currentToken?.token) {
			fetchEmisUnavailableReasons();
		}
	}, [currentToken?.token]);

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

	// State for EMIS unavailable reasons
	const [emisUnavailableReasons, setEmisUnavailableReasons] = useState<
		Array<{
			label: string;
			value: number;
		}>
	>([]);
	const [isLoadingEmisReasons, setIsLoadingEmisReasons] = useState(false);

	// Fetch EMIS unavailable reasons
	const fetchEmisUnavailableReasons = async () => {
		if (!currentToken?.token) return;

		setIsLoadingEmisReasons(true);
		try {
			const response = await fetch(
				"https://umisapi.tnega.org/api/lookup/EMISNAReasons",
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
				// Transform API response to match Combobox option format
				const transformedData = data.map(
					(item: { key: number; value: string }) => ({
						label: item.value,
						value: item.key,
					}),
				);
				setEmisUnavailableReasons(transformedData);
			} else {
				console.error("Failed to fetch EMIS reasons:", response.status);
				setEmisUnavailableReasons([]);
			}
		} catch (error) {
			console.error("Error fetching EMIS reasons:", error);
			setEmisUnavailableReasons([]);
		} finally {
			setIsLoadingEmisReasons(false);
		}
	};

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

		// Clear verification result when input changes
		if (emisVerificationResult) {
			setEmisVerificationResult(null);
		}

		// Clear EMIS data when input changes
		if (emisData) {
			setEmisData(null);
		}
	};

	const populateFormFromEmisData = (data: EmisData) => {
		// Extract relevant data from EMIS response and populate form
		updateFormData({
			studentNameCertificate: data.value.stuName || "",
			gender:
				data.value.gender === "Boy"
					? "male"
					: data.value.gender === "Girl"
						? "female"
						: "third_gender",
			bloodGroup: data.value.bloodgroup || "",
			dateOfBirth: data.value.dob || "",
			religion: data.value.religion || "",
			community: data.value.community || "",
			differentlyAbled: data.value.differently_abled === "Yes" ? "yes" : "no",
		});

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

	const handleVerifyEmis = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!emisId.trim()) {
			setEmisVerificationResult("❌ EMIS ID is required");
			return;
		}

		// Validate EMIS ID format
		if (!validateEmisId(emisId)) {
			setEmisVerificationResult(
				"❌ EMIS ID must be exactly 16 digits (e.g., 3302100091600216)",
			);
			return;
		}

		// Check if user is authenticated
		if (!currentToken?.token) {
			setEmisVerificationResult(
				"❌ Error: You must be authenticated to verify EMIS ID. Please login first.",
			);
			return;
		}

		setIsVerifyingEmis(true);
		setEmisVerificationResult(null);

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

			if (response.ok) {
				const data = await response.json();
				setEmisData(data);
				populateFormFromEmisData(data);
				setEmisVerificationResult(
					"✅ EMIS ID verified successfully! Form has been pre-filled with your information.",
				);
				updateFormData({ emisAvailable: "yes" });
			} else {
				setEmisVerificationResult(
					`❌ Verification failed: ${response.status} ${response.statusText}`,
				);
			}
		} catch (error) {
			setEmisVerificationResult(
				`❌ Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
			);
		} finally {
			setIsVerifyingEmis(false);
		}
	};

	// Handle community change
	const handleCommunityChange = (value: string) => {
		updateFormData({ community: value, caste: "" });
		fetchCasteList(value);
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h3 className="text-xl font-semibold text-blue-600 mb-2">
					General Information
				</h3>
				<p className="text-gray-600 text-sm">
					Please provide your basic information below
				</p>
			</div>

			{/* EMIS ID Verification */}
			<div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
				<Label className="text-base font-medium text-blue-800 mb-3 block">
					EMIS ID Verification *
				</Label>

				{/* Authentication Status */}
				{!currentToken?.token && (
					<div className="p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 mb-4">
						<p className="text-sm font-medium">⚠️ Authentication Required</p>
						<p className="text-xs mt-1">
							You must be authenticated with a valid UMIS token to verify EMIS
							IDs.
						</p>
					</div>
				)}

				{/* EMIS ID Input Form */}
				<form onSubmit={handleVerifyEmis} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="emisId">EMIS ID</Label>
						<div className="flex gap-2">
							<Input
								id="emisId"
								placeholder="3302100091600216"
								value={emisId}
								onChange={(e) => handleEmisIdChange(e.target.value)}
								className={`flex-1 font-mono text-sm ${emisData ? "bg-gray-100 text-gray-500" : ""}`}
								disabled={
									!currentToken?.token ||
									formData.emisAvailable === "no" ||
									emisData !== null
								}
								maxLength={16}
							/>
							<Button
								type="submit"
								disabled={
									isVerifyingEmis ||
									!emisId.trim() ||
									!currentToken?.token ||
									formData.emisAvailable === "no" ||
									emisData !== null
								}
								className={
									emisData ? "bg-gray-400 cursor-not-allowed px-6" : "px-6"
								}
							>
								{emisData
									? "✓ Verified"
									: isVerifyingEmis
										? "Verifying..."
										: "Verify"}
							</Button>
						</div>

						{/* Character Count */}
						<p className="text-xs text-gray-500">{emisId.length}/16 digits</p>
					</div>
				</form>

				{/* Verification Result */}
				{emisVerificationResult && (
					<div
						className={`mt-4 p-4 rounded-md ${
							emisVerificationResult.includes("✅")
								? "bg-green-50 border border-green-200 text-green-800"
								: "bg-red-50 border border-red-200 text-red-800"
						}`}
					>
						<p className="text-sm font-medium">{emisVerificationResult}</p>
					</div>
				)}

				{/* EMIS Data Display */}
				{emisData && (
					<div className="mt-6 p-4 bg-white rounded-lg border border-blue-100">
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
						</div>
					</div>
				)}

				{/* EMIS Availability Radio Buttons */}
				<div className="mt-6">
					<Label className="text-base font-medium text-blue-800 mb-3 block">
						Do you have an EMIS ID? *
					</Label>
					<div className="flex gap-6">
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="emisAvailable"
								value="yes"
								checked={formData.emisAvailable === "yes"}
								onChange={(e) => {
									updateFormData({
										emisAvailable: e.target.value as "yes" | "no",
										emisUnavailableReason: 0,
									});
									if (e.target.value === "no") {
										setEmisId("");
										setEmisData(null);
										setEmisVerificationResult(null);
									}
								}}
								disabled={emisData !== null}
								className={`${emisData ? "text-gray-400" : "text-blue-600"}`}
							/>
							<span
								className={`text-sm font-medium ${emisData ? "text-gray-400" : ""}`}
							>
								Yes
							</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="emisAvailable"
								value="no"
								checked={formData.emisAvailable === "no"}
								onChange={(e) => {
									updateFormData({
										emisAvailable: e.target.value as "yes" | "no",
										emisUnavailableReason: 0,
									});
									setEmisId("");
									setEmisData(null);
									setEmisVerificationResult(null);
								}}
								disabled={emisData !== null}
								className={`${emisData ? "text-gray-400" : "text-blue-600"}`}
							/>
							<span
								className={`text-sm font-medium ${emisData ? "text-gray-400" : ""}`}
							>
								No
							</span>
						</label>
					</div>
					{validationErrors.emisAvailable && (
						<p className="text-red-600 text-sm mt-1">
							{validationErrors.emisAvailable}
						</p>
					)}
				</div>
			</div>

			{/* Reason for EMIS unavailability - Conditional */}
			{formData.emisAvailable === "no" && (
				<div className="space-y-2">
					<Label htmlFor="emisUnavailableReason">
						Reason for unavailability of EMIS-ID? *
					</Label>
					<Combobox
						options={emisUnavailableReasons.map((reason) => ({
							...reason,
							value: reason.value.toString(),
						}))}
						value={
							formData.emisUnavailableReason
								? formData.emisUnavailableReason.toString()
								: ""
						}
						onValueChange={(value) =>
							updateFormData({
								emisUnavailableReason: Number.parseInt(value, 10),
							})
						}
						placeholder={isLoadingEmisReasons ? "Loading..." : "Select reason"}
						searchPlaceholder="Search reason..."
						disabled={isLoadingEmisReasons}
						emptyText={
							emisUnavailableReasons.length === 0
								? "Failed to load reasons. Please try again."
								: "No matching reasons found."
						}
					/>
					{validationErrors.emisUnavailableReason && (
						<p className="text-red-600 text-sm">
							{validationErrors.emisUnavailableReason}
						</p>
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
						<p className="text-red-600 text-sm">
							{validationErrors.salutation}
						</p>
					)}
				</div>

				{/* Student Name (As on Certificate) */}
				<div className="space-y-2">
					<Label htmlFor="studentNameCertificate">
						Student Name (As on Certificate) *
					</Label>
					<Input
						id="studentNameCertificate"
						value={formData.studentNameCertificate}
						onChange={(e) =>
							updateFormData({ studentNameCertificate: e.target.value })
						}
						placeholder="Enter name as on certificate"
					/>
					{validationErrors.studentNameCertificate && (
						<p className="text-red-600 text-sm">
							{validationErrors.studentNameCertificate}
						</p>
					)}
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
							updateFormData({ studentNameAadhaar: e.target.value })
						}
						placeholder="Enter name as on Aadhaar"
					/>
					{validationErrors.studentNameAadhaar && (
						<p className="text-red-600 text-sm">
							{validationErrors.studentNameAadhaar}
						</p>
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
						<p className="text-red-600 text-sm">
							{validationErrors.nationality}
						</p>
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
								onChange={(e) =>
									updateFormData({
										gender: e.target.value as
											| "male"
											| "female"
											| "third_gender",
									})
								}
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
								onChange={(e) =>
									updateFormData({
										gender: e.target.value as
											| "male"
											| "female"
											| "third_gender",
									})
								}
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
								onChange={(e) =>
									updateFormData({
										gender: e.target.value as
											| "male"
											| "female"
											| "third_gender",
									})
								}
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
						<p className="text-red-600 text-sm">
							{validationErrors.bloodGroup}
						</p>
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
						<p className="text-red-600 text-sm">
							{validationErrors.dateOfBirth}
						</p>
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
					<Label htmlFor="communityCertificateNumber">
						Community Certificate Number *
					</Label>
					<Input
						id="communityCertificateNumber"
						value={formData.communityCertificateNumber}
						onChange={(e) =>
							updateFormData({ communityCertificateNumber: e.target.value })
						}
						placeholder="Enter community certificate number"
					/>
					{validationErrors.communityCertificateNumber && (
						<p className="text-red-600 text-sm">
							{validationErrors.communityCertificateNumber}
						</p>
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
						disabled={kycData !== null}
						className={`flex-1 ${kycData ? "bg-gray-100 text-gray-500" : ""}`}
					/>
					<Button
						type="button"
						onClick={handleVerifyAadhaar}
						disabled={
							!formData.aadhaarNumber ||
							formData.aadhaarNumber.length !== 12 ||
							kycData !== null
						}
						className={
							kycData
								? "bg-gray-400 cursor-not-allowed"
								: "bg-green-600 hover:bg-green-700"
						}
					>
						{kycData ? "✓ Verified" : "Verify Aadhaar"}
					</Button>
				</div>
				{validationErrors.aadhaarNumber && (
					<p className="text-red-600 text-sm">
						{validationErrors.aadhaarNumber}
					</p>
				)}
				{otpError && <p className="text-red-600 text-sm">{otpError}</p>}

				{/* KYC Data Display */}
				{kycData && (
					<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
						<h4 className="font-medium text-green-800 mb-3">
							✓ Aadhaar Verified Successfully
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
							<div>
								<span className="font-medium text-green-700">Name:</span>
								<span className="ml-2 text-green-600">{kycData.name}</span>
							</div>
							<div>
								<span className="font-medium text-green-700">
									Date of Birth:
								</span>
								<span className="ml-2 text-green-600">{kycData.dob}</span>
							</div>
							<div>
								<span className="font-medium text-green-700">Gender:</span>
								<span className="ml-2 text-green-600">
									{kycData.gender === "M"
										? "Male"
										: kycData.gender === "F"
											? "Female"
											: "Other"}
								</span>
							</div>
							<div>
								<span className="font-medium text-green-700">Address:</span>
								<span className="ml-2 text-green-600">
									{kycData.house}, {kycData.street},{" "}
									{kycData.landMark && `${kycData.landMark}, `}
									{kycData.village}, {kycData.district}, {kycData.state} -{" "}
									{kycData.pinCode}
								</span>
							</div>
						</div>
						{kycData.photoBase64String && (
							<div className="mt-4">
								<span className="font-medium text-green-700">Photo:</span>
								<img
									src={`data:image/jpeg;base64,${kycData.photoBase64String}`}
									alt="Verified user from Aadhaar"
									className="mt-2 w-24 h-24 object-cover rounded-lg border border-green-200"
								/>
							</div>
						)}
					</div>
				)}

				{/* OTP Verification Dialog */}
				<Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Enter OTP</DialogTitle>
							<DialogDescription>
								Please enter the 6-digit OTP sent to your registered mobile
								number.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="otp">OTP</Label>
								<Input
									id="otp"
									placeholder="Enter 6-digit OTP"
									value={otp}
									onChange={(e) => {
										// Only allow digits and limit to 6 characters
										const value = e.target.value.replace(/\D/g, "").slice(0, 6);
										setOtp(value);
									}}
									maxLength={6}
									className="font-mono text-lg tracking-wider"
								/>
							</div>
							<div className="flex justify-end gap-3">
								<Button
									variant="outline"
									onClick={() => {
										setIsOtpDialogOpen(false);
										setOtp("");
										setOtpError(null);
									}}
								>
									Cancel
								</Button>
								<Button
									onClick={handleVerifyOtp}
									disabled={otp.length !== 6 || isVerifyingOtp}
								>
									{isVerifyingOtp ? "Verifying..." : "Verify OTP"}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
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
								onChange={(e) =>
									updateFormData({
										firstGraduate: e.target.value as
											| "yes"
											| "no"
											| "not_applicable",
									})
								}
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
								onChange={(e) =>
									updateFormData({
										firstGraduate: e.target.value as
											| "yes"
											| "no"
											| "not_applicable",
									})
								}
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
								onChange={(e) =>
									updateFormData({
										firstGraduate: e.target.value as
											| "yes"
											| "no"
											| "not_applicable",
									})
								}
								className="text-blue-600"
							/>
							<span className="text-sm">Not Applicable</span>
						</label>
					</div>
					{validationErrors.firstGraduate && (
						<p className="text-red-600 text-sm">
							{validationErrors.firstGraduate}
						</p>
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
								onChange={(e) =>
									updateFormData({
										specialQuota: e.target.value as "yes" | "no",
									})
								}
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
								onChange={(e) =>
									updateFormData({
										specialQuota: e.target.value as "yes" | "no",
									})
								}
								className="text-blue-600"
							/>
							<span className="text-sm">No</span>
						</label>
					</div>
					{validationErrors.specialQuota && (
						<p className="text-red-600 text-sm">
							{validationErrors.specialQuota}
						</p>
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
								onChange={(e) =>
									updateFormData({
										differentlyAbled: e.target.value as "yes" | "no",
									})
								}
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
								onChange={(e) =>
									updateFormData({
										differentlyAbled: e.target.value as "yes" | "no",
									})
								}
								className="text-blue-600"
							/>
							<span className="text-sm">No</span>
						</label>
					</div>
					{validationErrors.differentlyAbled && (
						<p className="text-red-600 text-sm">
							{validationErrors.differentlyAbled}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};
