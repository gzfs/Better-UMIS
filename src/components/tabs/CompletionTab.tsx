import { useState } from "react";
import { CheckCircle, Download, Send, User, Phone, MapPin, GraduationCap, CreditCard } from "lucide-react";
import { umisApiService } from "../../lib/umisApiService";
import type { UmisTokensRecord } from "../../lib/xata.codegen";
import { Button } from "../ui/button";
import type { StudentFormData } from "../StudentRegistrationWizard";

interface CompletionTabProps {
	formData: StudentFormData;
	currentToken: UmisTokensRecord | null;
}

export const CompletionTab = ({ formData, currentToken }: CompletionTabProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [applicationNumber, setApplicationNumber] = useState<string>("");

	// Submit the form data and approve student using UMIS API
	const handleSubmit = async () => {
		if (!currentToken?.token) {
			alert("No authentication token available. Please log in again.");
			return;
		}

		setIsSubmitting(true);
		try {
			// Use the student approval endpoint with student ID
			// In a real implementation, this student ID would come from the previous save operations
			const studentId = 6693300; // This should be dynamic from the form save operations
			
			const approvalPayload = {
				studentApprovedType: 1, // 1 for approved
				id: studentId,
				rejectedRemarkId: null,
			};

			// Call the student approval API
			const response = await umisApiService.updateStudentApproval(
				approvalPayload,
				currentToken.token,
			);

			if (response.isSuccess) {
				setApplicationNumber(`UMIS${studentId}`);
				setIsSubmitted(true);
			} else {
				alert(`Submission failed: ${response.message || "Please try again"}`);
			}
		} catch (error) {
			console.error("Error submitting form:", error);
			alert("An error occurred while submitting the form. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Generate PDF summary (placeholder implementation)
	const generatePDF = () => {
		console.log("Generating PDF summary for application:", applicationNumber);
		alert("PDF generation feature will be implemented soon.");
	};

	if (isSubmitted) {
		return (
			<div className="space-y-8">
				<div className="text-center">
					<div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
						<CheckCircle className="w-12 h-12 text-green-600" />
					</div>
					<h3 className="text-2xl font-bold text-green-600 mb-2">Registration Successful!</h3>
					<p className="text-gray-600">Your UMIS student registration has been completed successfully.</p>
				</div>

				{/* Application Details */}
				<div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
					<h4 className="text-lg font-semibold text-green-800 mb-2">Application Number</h4>
					<p className="text-2xl font-bold text-green-600 mb-4">{applicationNumber}</p>
					<p className="text-sm text-green-700">
						Please save this application number for future reference
					</p>
				</div>

				{/* Next Steps */}
				<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
					<h4 className="text-lg font-semibold text-blue-800 mb-4">Next Steps</h4>
					<div className="space-y-3">
						<div className="flex items-start space-x-3">
							<div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
							<p className="text-sm text-blue-700">
								<strong>Document Verification:</strong> Visit your institution with required documents for verification
							</p>
						</div>
						<div className="flex items-start space-x-3">
							<div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
							<p className="text-sm text-blue-700">
								<strong>Profile Activation:</strong> Your profile will be activated after document verification
							</p>
						</div>
						<div className="flex items-start space-x-3">
							<div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
							<p className="text-sm text-blue-700">
								<strong>Scholarship Services:</strong> Access various scholarship and welfare schemes
							</p>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-center space-x-4">
					<Button onClick={generatePDF} className="flex items-center gap-2">
						<Download className="w-4 h-4" />
						Download Summary
					</Button>
					<Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
						<Send className="w-4 h-4" />
						Print Application
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="text-center">
				<h3 className="text-xl font-semibold text-blue-600 mb-2">Review & Submit</h3>
				<p className="text-gray-600 text-sm">Please review all information before submitting your registration</p>
			</div>

			{/* Summary Sections */}
			<div className="space-y-6">
				{/* General Information Summary */}
				<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
					<div className="flex items-center gap-2 mb-4">
						<User className="w-5 h-5 text-blue-600" />
						<h4 className="text-lg font-semibold text-blue-800">General Information</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-medium text-gray-700">Name (Certificate):</span>
							<span className="ml-2">{formData.studentNameCertificate || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Name (Aadhaar):</span>
							<span className="ml-2">{formData.studentNameAadhaar || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Gender:</span>
							<span className="ml-2">{formData.gender || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Date of Birth:</span>
							<span className="ml-2">{formData.dateOfBirth || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Community:</span>
							<span className="ml-2">{formData.community || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Caste:</span>
							<span className="ml-2">{formData.caste || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Community Certificate:</span>
							<span className="ml-2">{formData.communityCertificateNumber || "Not provided"}</span>
						</div>
					</div>
				</div>

				{/* Contact Information Summary */}
				<div className="bg-green-50 p-6 rounded-lg border border-green-200">
					<div className="flex items-center gap-2 mb-4">
						<Phone className="w-5 h-5 text-green-600" />
						<h4 className="text-lg font-semibold text-green-800">Contact Information</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-medium text-gray-700">Mobile:</span>
							<span className="ml-2">{formData.mobileNumber || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Email:</span>
							<span className="ml-2">{formData.emailId || "Not provided"}</span>
						</div>
						<div className="md:col-span-2">
							<span className="font-medium text-gray-700">Permanent Address:</span>
							<span className="ml-2">{formData.permanentAddress.postalAddress || "Not provided"}</span>
						</div>
					</div>
				</div>

				{/* Family Information Summary */}
				<div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
					<div className="flex items-center gap-2 mb-4">
						<MapPin className="w-5 h-5 text-purple-600" />
						<h4 className="text-lg font-semibold text-purple-800">Family Information</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-medium text-gray-700">Father's Name:</span>
							<span className="ml-2">{formData.fatherName || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Mother's Name:</span>
							<span className="ml-2">{formData.motherName || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Annual Income:</span>
							<span className="ml-2">₹{formData.familyAnnualIncome || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Parent Mobile:</span>
							<span className="ml-2">{formData.parentMobileNumber || "Not provided"}</span>
						</div>
					</div>
				</div>

				{/* Academic Information Summary */}
				<div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
					<div className="flex items-center gap-2 mb-4">
						<GraduationCap className="w-5 h-5 text-orange-600" />
						<h4 className="text-lg font-semibold text-orange-800">Academic Information</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-medium text-gray-700">Course:</span>
							<span className="ml-2">{formData.course || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Branch:</span>
							<span className="ml-2">{formData.branchSpecialization || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Year of Study:</span>
							<span className="ml-2">{formData.yearOfStudy || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Academic Year:</span>
							<span className="ml-2">{formData.academicYear || "Not provided"}</span>
						</div>
					</div>
				</div>

				{/* Bank Information Summary */}
				<div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
					<div className="flex items-center gap-2 mb-4">
						<CreditCard className="w-5 h-5 text-yellow-600" />
						<h4 className="text-lg font-semibold text-yellow-800">Bank Information</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-medium text-gray-700">Account Number:</span>
							<span className="ml-2">{formData.accountNumber ? "••••••••" + formData.accountNumber.slice(-4) : "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">IFSC Code:</span>
							<span className="ml-2">{formData.ifscCode || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Bank Name:</span>
							<span className="ml-2">{formData.bankName || "Not provided"}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700">Branch:</span>
							<span className="ml-2">{formData.bankBranch || "Not provided"}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Declaration */}
			<div className="bg-red-50 p-6 rounded-lg border border-red-200">
				<h4 className="text-lg font-semibold text-red-800 mb-4">Declaration</h4>
				<div className="space-y-3 text-sm text-red-700">
					<div className="flex items-start space-x-2">
						<input type="checkbox" className="mt-1" required />
						<p>I hereby declare that all the information provided by me is true and correct to the best of my knowledge.</p>
					</div>
					<div className="flex items-start space-x-2">
						<input type="checkbox" className="mt-1" required />
						<p>I understand that any false information may lead to cancellation of my registration and admission.</p>
					</div>
					<div className="flex items-start space-x-2">
						<input type="checkbox" className="mt-1" required />
						<p>I agree to provide necessary documents for verification when required by the authorities.</p>
					</div>
					<div className="flex items-start space-x-2">
						<input type="checkbox" className="mt-1" required />
						<p>I consent to the processing of my personal data for educational and administrative purposes.</p>
					</div>
				</div>
			</div>

			{/* Submit Button */}
			<div className="text-center">
				<Button 
					onClick={handleSubmit}
					disabled={isSubmitting}
					className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
				>
					{isSubmitting ? (
						<>
							<div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
							Submitting...
						</>
					) : (
						<>
							<Send className="w-5 h-5 mr-2" />
							Submit Registration
						</>
					)}
				</Button>
			</div>

			{/* Important Notice */}
			<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
				<h5 className="font-medium text-gray-800 mb-2">⚠️ Important Notice:</h5>
				<ul className="text-sm text-gray-700 space-y-1">
					<li>• Once submitted, you cannot modify the information</li>
					<li>• Keep your application number safe for future reference</li>
					<li>• Visit your institution within 7 days for document verification</li>
					<li>• Bring all original documents for verification</li>
					<li>• Contact your institution's UMIS coordinator for any queries</li>
					<li>• Submission uses UMIS student approval API for final registration</li>
					<li>• Authentication is required for successful submission</li>
				</ul>
			</div>
		</div>
	);
};