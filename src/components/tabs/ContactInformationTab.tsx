import { useState } from "react";
import {
	transformContactInfoToPayload,
	umisApiService,
} from "../../lib/umisApiService";
import type { UmisTokensRecord } from "../../lib/xata.codegen";
import { Button } from "../ui/button";
import { Combobox } from "../ui/combobox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { StudentFormData } from "../StudentRegistrationWizard";

interface ContactInformationTabProps {
	formData: StudentFormData;
	updateFormData: (updates: Partial<StudentFormData>) => void;
	validationErrors: Record<string, string>;
	currentToken: UmisTokensRecord | null;
}

export const ContactInformationTab = ({
	formData,
	updateFormData,
	validationErrors,
	currentToken,
}: ContactInformationTabProps) => {
	const [districts, setDistricts] = useState<Array<{ label: string; value: string }>>([]);
	const [taluks, setTaluks] = useState<Array<{ label: string; value: string }>>([]);
	
	// Save functionality state
	const [isSaving, setIsSaving] = useState(false);
	const [saveResult, setSaveResult] = useState<{
		success: boolean;
		message: string;
	} | null>(null);

	// Location type options
	const locationTypeOptions = [
		{ label: "Rural", value: "Rural" },
		{ label: "Urban", value: "Urban" },
	];

	// Country options
	const countryOptions = [
		{ label: "India", value: "India" },
		{ label: "Others", value: "Others" },
	];

	// State options
	const stateOptions = [
		{ label: "Tamil Nadu", value: "Tamil Nadu" },
		{ label: "Andhra Pradesh", value: "Andhra Pradesh" },
		{ label: "Karnataka", value: "Karnataka" },
		{ label: "Kerala", value: "Kerala" },
		{ label: "Telangana", value: "Telangana" },
		// Add more states as needed
	];

	// Sample districts for Tamil Nadu (in real implementation, fetch from API)
	const tamilNaduDistricts = [
		{ label: "Chennai", value: "Chennai" },
		{ label: "Coimbatore", value: "Coimbatore" },
		{ label: "Madurai", value: "Madurai" },
		{ label: "Tiruchirappalli", value: "Tiruchirappalli" },
		{ label: "Salem", value: "Salem" },
		{ label: "Tirunelveli", value: "Tirunelveli" },
		{ label: "Tiruppur", value: "Tiruppur" },
		{ label: "Vellore", value: "Vellore" },
		{ label: "Erode", value: "Erode" },
		{ label: "Thoothukkudi", value: "Thoothukkudi" },
		// Add more districts
	];

	// Handle state change to load districts
	const handleStateChange = (value: string, addressType: "permanent" | "communication") => {
		if (addressType === "permanent") {
			updateFormData({
				permanentAddress: {
					...formData.permanentAddress,
					state: value,
					district: "",
					taluk: "",
				},
			});
		} else {
			updateFormData({
				communicationAddress: {
					...formData.communicationAddress,
					state: value,
					district: "",
					taluk: "",
				},
			});
		}

		// In real implementation, fetch districts based on state
		if (value === "Tamil Nadu") {
			setDistricts(tamilNaduDistricts);
		} else {
			setDistricts([]);
		}
		setTaluks([]);
	};

	// Handle district change to load taluks
	const handleDistrictChange = (value: string, addressType: "permanent" | "communication") => {
		if (addressType === "permanent") {
			updateFormData({
				permanentAddress: {
					...formData.permanentAddress,
					district: value,
					taluk: "",
				},
			});
		} else {
			updateFormData({
				communicationAddress: {
					...formData.communicationAddress,
					district: value,
					taluk: "",
				},
			});
		}

		// In real implementation, fetch taluks based on district
		// For now, provide sample taluks
		const sampleTaluks = [
			{ label: `${value} Taluk 1`, value: `${value}_taluk_1` },
			{ label: `${value} Taluk 2`, value: `${value}_taluk_2` },
			{ label: `${value} Taluk 3`, value: `${value}_taluk_3` },
		];
		setTaluks(sampleTaluks);
	};

	// Handle "Same as Permanent Address" checkbox
	const handleSameAsPermanentChange = (checked: boolean) => {
		if (checked) {
			updateFormData({
				communicationAddress: {
					...formData.permanentAddress,
					sameAsPermanent: true,
				},
			});
		} else {
			updateFormData({
				communicationAddress: {
					...formData.communicationAddress,
					sameAsPermanent: false,
				},
			});
		}
	};

	// Validate email format
	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Validate mobile number format
	const validateMobile = (mobile: string) => {
		const mobileRegex = /^[6-9]\d{9}$/;
		return mobileRegex.test(mobile);
	};

	// Save contact information to UMIS API
	const handleSaveContactInfo = async () => {
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
			const payload = transformContactInfoToPayload(formData, studentId);

			// Call the API
			const response = await umisApiService.saveStudentContactDetails(
				payload,
				currentToken.token,
			);

			if (response.isSuccess) {
				setSaveResult({
					success: true,
					message: "Contact information saved successfully!",
				});
			} else {
				setSaveResult({
					success: false,
					message: response.message || "Failed to save contact information",
				});
			}
		} catch (error) {
			console.error("Error saving contact information:", error);
			setSaveResult({
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Failed to save contact information",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-8">
			<div className="text-center">
				<h3 className="text-xl font-semibold text-blue-600 mb-2">Contact Information</h3>
				<p className="text-gray-600 text-sm">Please provide your contact details and address information</p>
			</div>

			{/* Mobile Number and Email */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<Label htmlFor="mobileNumber">Mobile Number *</Label>
					<Input
						id="mobileNumber"
						value={formData.mobileNumber}
						onChange={(e) => {
							const value = e.target.value.replace(/\D/g, "").slice(0, 10);
							updateFormData({ mobileNumber: value });
						}}
						placeholder="10-digit mobile number"
						maxLength={10}
					/>
					{validationErrors.mobileNumber && (
						<p className="text-red-600 text-sm">{validationErrors.mobileNumber}</p>
					)}
					{formData.mobileNumber && !validateMobile(formData.mobileNumber) && (
						<p className="text-red-600 text-sm">Please enter a valid 10-digit mobile number</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="emailId">Email ID *</Label>
					<Input
						id="emailId"
						type="email"
						value={formData.emailId}
						onChange={(e) => updateFormData({ emailId: e.target.value })}
						placeholder="your.email@example.com"
					/>
					{validationErrors.emailId && (
						<p className="text-red-600 text-sm">{validationErrors.emailId}</p>
					)}
					{formData.emailId && !validateEmail(formData.emailId) && (
						<p className="text-red-600 text-sm">Please enter a valid email address</p>
					)}
				</div>
			</div>

			{/* Permanent Address */}
			<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
				<h4 className="text-lg font-semibold text-blue-800 mb-4">Permanent Address</h4>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="permCountry">Country *</Label>
						<Combobox
							options={countryOptions}
							value={formData.permanentAddress.country}
							onValueChange={(value) => updateFormData({
								permanentAddress: { ...formData.permanentAddress, country: value }
							})}
							placeholder="Select Country"
							searchPlaceholder="Search country..."
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="permState">State *</Label>
						<Combobox
							options={stateOptions}
							value={formData.permanentAddress.state}
							onValueChange={(value) => handleStateChange(value, "permanent")}
							placeholder="Select State"
							searchPlaceholder="Search state..."
						/>
						{validationErrors.permanentState && (
							<p className="text-red-600 text-sm">{validationErrors.permanentState}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="permLocationType">Location Type *</Label>
						<Combobox
							options={locationTypeOptions}
							value={formData.permanentAddress.locationType}
							onValueChange={(value) => updateFormData({
								permanentAddress: { ...formData.permanentAddress, locationType: value }
							})}
							placeholder="Select Location Type"
							searchPlaceholder="Search location type..."
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="permDistrict">District *</Label>
						<Combobox
							options={districts}
							value={formData.permanentAddress.district}
							onValueChange={(value) => handleDistrictChange(value, "permanent")}
							placeholder="Select District"
							searchPlaceholder="Search district..."
							disabled={districts.length === 0}
						/>
						{validationErrors.permanentDistrict && (
							<p className="text-red-600 text-sm">{validationErrors.permanentDistrict}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="permTaluk">Taluk *</Label>
						<Combobox
							options={taluks}
							value={formData.permanentAddress.taluk}
							onValueChange={(value) => updateFormData({
								permanentAddress: { ...formData.permanentAddress, taluk: value }
							})}
							placeholder="Select Taluk"
							searchPlaceholder="Search taluk..."
							disabled={taluks.length === 0}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="permVillage">Village *</Label>
						<Input
							id="permVillage"
							value={formData.permanentAddress.village}
							onChange={(e) => updateFormData({
								permanentAddress: { ...formData.permanentAddress, village: e.target.value }
							})}
							placeholder="Enter village name"
						/>
					</div>

					{/* Urban Area Fields */}
					{formData.permanentAddress.locationType === "Urban" && (
						<>
							<div className="space-y-2">
								<Label htmlFor="permCorporation">Corporation/Municipality</Label>
								<Input
									id="permCorporation"
									value={formData.permanentAddress.corporation}
									onChange={(e) => updateFormData({
										permanentAddress: { ...formData.permanentAddress, corporation: e.target.value }
									})}
									placeholder="Enter corporation/municipality"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="permZone">Zone</Label>
								<Input
									id="permZone"
									value={formData.permanentAddress.zone}
									onChange={(e) => updateFormData({
										permanentAddress: { ...formData.permanentAddress, zone: e.target.value }
									})}
									placeholder="Enter zone"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="permWard">Ward</Label>
								<Input
									id="permWard"
									value={formData.permanentAddress.ward}
									onChange={(e) => updateFormData({
										permanentAddress: { ...formData.permanentAddress, ward: e.target.value }
									})}
									placeholder="Enter ward"
								/>
							</div>
						</>
					)}

					{/* Rural Area Fields */}
					{formData.permanentAddress.locationType === "Rural" && (
						<>
							<div className="space-y-2">
								<Label htmlFor="permBlock">Block</Label>
								<Input
									id="permBlock"
									value={formData.permanentAddress.block}
									onChange={(e) => updateFormData({
										permanentAddress: { ...formData.permanentAddress, block: e.target.value }
									})}
									placeholder="Enter block"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="permVillagePanchayat">Village/Panchayat</Label>
								<Input
									id="permVillagePanchayat"
									value={formData.permanentAddress.villagePanchayat}
									onChange={(e) => updateFormData({
										permanentAddress: { ...formData.permanentAddress, villagePanchayat: e.target.value }
									})}
									placeholder="Enter village/panchayat"
								/>
							</div>
						</>
					)}
				</div>

				<div className="mt-4 space-y-2">
					<Label htmlFor="permPostalAddress">Postal Address *</Label>
					<textarea
						id="permPostalAddress"
						value={formData.permanentAddress.postalAddress}
						onChange={(e) => updateFormData({
							permanentAddress: { ...formData.permanentAddress, postalAddress: e.target.value }
						})}
						placeholder="Enter complete postal address"
						className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						rows={3}
					/>
					{validationErrors.permanentPostalAddress && (
						<p className="text-red-600 text-sm">{validationErrors.permanentPostalAddress}</p>
					)}
				</div>
			</div>

			{/* Communication Address */}
			<div className="bg-green-50 p-6 rounded-lg border border-green-200">
				<div className="flex items-center justify-between mb-4">
					<h4 className="text-lg font-semibold text-green-800">Communication Address</h4>
					<label className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={formData.communicationAddress.sameAsPermanent}
							onChange={(e) => handleSameAsPermanentChange(e.target.checked)}
							className="text-green-600"
						/>
						<span className="text-sm font-medium text-green-700">Same as Permanent Address</span>
					</label>
				</div>

				{!formData.communicationAddress.sameAsPermanent && (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="commCountry">Country *</Label>
								<Combobox
									options={countryOptions}
									value={formData.communicationAddress.country}
									onValueChange={(value) => updateFormData({
										communicationAddress: { ...formData.communicationAddress, country: value }
									})}
									placeholder="Select Country"
									searchPlaceholder="Search country..."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="commState">State *</Label>
								<Combobox
									options={stateOptions}
									value={formData.communicationAddress.state}
									onValueChange={(value) => handleStateChange(value, "communication")}
									placeholder="Select State"
									searchPlaceholder="Search state..."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="commLocationType">Location Type *</Label>
								<Combobox
									options={locationTypeOptions}
									value={formData.communicationAddress.locationType}
									onValueChange={(value) => updateFormData({
										communicationAddress: { ...formData.communicationAddress, locationType: value }
									})}
									placeholder="Select Location Type"
									searchPlaceholder="Search location type..."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="commDistrict">District *</Label>
								<Combobox
									options={districts}
									value={formData.communicationAddress.district}
									onValueChange={(value) => handleDistrictChange(value, "communication")}
									placeholder="Select District"
									searchPlaceholder="Search district..."
									disabled={districts.length === 0}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="commTaluk">Taluk *</Label>
								<Combobox
									options={taluks}
									value={formData.communicationAddress.taluk}
									onValueChange={(value) => updateFormData({
										communicationAddress: { ...formData.communicationAddress, taluk: value }
									})}
									placeholder="Select Taluk"
									searchPlaceholder="Search taluk..."
									disabled={taluks.length === 0}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="commVillage">Village *</Label>
								<Input
									id="commVillage"
									value={formData.communicationAddress.village}
									onChange={(e) => updateFormData({
										communicationAddress: { ...formData.communicationAddress, village: e.target.value }
									})}
									placeholder="Enter village name"
								/>
							</div>
						</div>

						<div className="mt-4 space-y-2">
							<Label htmlFor="commPostalAddress">Postal Address *</Label>
							<textarea
								id="commPostalAddress"
								value={formData.communicationAddress.postalAddress}
								onChange={(e) => updateFormData({
									communicationAddress: { ...formData.communicationAddress, postalAddress: e.target.value }
								})}
								placeholder="Enter complete postal address"
								className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
								rows={3}
							/>
						</div>
					</>
				)}

				{formData.communicationAddress.sameAsPermanent && (
					<div className="text-green-700 bg-green-100 p-4 rounded-md">
						<p className="font-medium">Communication address is same as permanent address</p>
						<p className="text-sm mt-1">{formData.permanentAddress.postalAddress}</p>
					</div>
				)}
			</div>

			{/* Save Button and Result */}
			<div className="space-y-4 pt-6 border-t border-gray-200">
				<div className="flex justify-center">
					<Button
						onClick={handleSaveContactInfo}
						disabled={isSaving || !currentToken?.token}
						className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
					>
						{isSaving ? "Saving..." : "Save Contact Information"}
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