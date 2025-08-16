// Comprehensive API Test Suite for Better-UMIS
// Run this in browser console to test all API integrations

export interface TestResult {
	testName: string;
	endpoint: string;
	method: string;
	status: 'PASS' | 'FAIL' | 'SKIP';
	responseTime: number;
	statusCode?: number;
	error?: string;
	data?: any;
}

export interface TestReport {
	timestamp: string;
	totalTests: number;
	passed: number;
	failed: number;
	skipped: number;
	results: TestResult[];
}

class APITestSuite {
	private token: string | null = null;
	private results: TestResult[] = [];

	constructor() {
		// Get token from localStorage
		this.token = localStorage.getItem('umis_auth_token');
	}

	private async runTest(
		testName: string,
		endpoint: string,
		method: string,
		options: RequestInit = {}
	): Promise<TestResult> {
		const startTime = Date.now();
		
		try {
			console.log(`🧪 Testing: ${testName}`);
			
			const response = await fetch(endpoint, {
				method,
				headers: {
					'Content-Type': 'application/json',
					...(this.token && { Authorization: `Bearer ${this.token}` }),
					...options.headers,
				},
				...options,
			});

			const responseTime = Date.now() - startTime;
			const data = await response.json().catch(() => null);

			const result: TestResult = {
				testName,
				endpoint,
				method,
				status: response.ok ? 'PASS' : 'FAIL',
				responseTime,
				statusCode: response.status,
				data,
				...(response.ok ? {} : { error: `HTTP ${response.status}: ${response.statusText}` }),
			};

			console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${testName}: ${response.status} (${responseTime}ms)`);
			
			this.results.push(result);
			return result;

		} catch (error) {
			const responseTime = Date.now() - startTime;
			const result: TestResult = {
				testName,
				endpoint,
				method,
				status: 'FAIL',
				responseTime,
				error: error instanceof Error ? error.message : 'Unknown error',
			};

			console.log(`❌ ${testName}: ${result.error} (${responseTime}ms)`);
			
			this.results.push(result);
			return result;
		}
	}

	// Test 1: Authentication Token Validation
	async testTokenValidation(): Promise<TestResult> {
		if (!this.token) {
			const result: TestResult = {
				testName: 'Token Validation',
				endpoint: 'localStorage',
				method: 'GET',
				status: 'FAIL',
				responseTime: 0,
				error: 'No token found in localStorage',
			};
			this.results.push(result);
			return result;
		}

		// Test if token is valid by making a simple API call
		return await this.runTest(
			'Token Validation',
			'/umis-api/api/user/profile',
			'GET'
		);
	}

	// Test 2: Caste List API with Different Communities
	async testCasteListAPI(): Promise<TestResult[]> {
		const communities = [
			{ id: '11', name: 'BC' },
			{ id: '3', name: 'MBC' },
			{ id: '12', name: 'SC' },
			{ id: '4', name: 'ST' },
		];

		const results: TestResult[] = [];

		for (const community of communities) {
			const result = await this.runTest(
				`Caste List API (${community.name})`,
				`/umis-api/api/community/casteList/${community.id}`,
				'GET'
			);
			results.push(result);
			
			// Add small delay between requests
			await new Promise(resolve => setTimeout(resolve, 500));
		}

		return results;
	}

	// Test 3: IFSC Validation API
	async testIFSCValidationAPI(): Promise<TestResult[]> {
		const ifscCodes = [
			{ code: 'SBIN0001234', expected: 'PASS' },
			{ code: 'HDFC0000001', expected: 'PASS' },
			{ code: 'ICIC0000001', expected: 'PASS' },
			{ code: 'INVALID123', expected: 'FAIL' },
		];

		const results: TestResult[] = [];

		for (const ifsc of ifscCodes) {
			const result = await this.runTest(
				`IFSC Validation (${ifsc.code})`,
				`https://ifsc.razorpay.com/${ifsc.code}`,
				'GET'
			);
			results.push(result);
			
			// Add small delay between requests
			await new Promise(resolve => setTimeout(resolve, 300));
		}

		return results;
	}

	// Test 4: Student Registration API (with comprehensive mock data)
	async testStudentRegistrationAPI(): Promise<TestResult[]> {
		const results: TestResult[] = [];

		// Test 1: Comprehensive form data
		const comprehensiveData = {
			// General Information
			emisAvailable: "no",
			emisUnavailableReason: "not_tn_student",
			salutation: "Selvan",
			studentNameCertificate: "Arun Kumar Selvam",
			studentNameAadhaar: "Arun Kumar Selvam",
			nationality: "Indian",
			stateName: "Tamil Nadu",
			gender: "male",
			bloodGroup: "B+",
			dateOfBirth: "2002-05-15",
			religion: "Hindu",
			community: "11", // BC
			caste: "Agamudayar",
			aadhaarNumber: "123456789012",
			firstGraduate: "yes",
			specialQuota: "no",
			differentlyAbled: "no",
			
			// Contact Information
			mobileNumber: "9876543210",
			emailId: "arun.kumar@example.com",
			permanentAddress: {
				postalAddress: "No. 45, Gandhi Street, Mylapore",
				district: "Chennai",
				taluk: "Chennai",
				village: "Mylapore",
				pincode: "600004",
			},
			communicationAddress: {
				postalAddress: "No. 45, Gandhi Street, Mylapore",
				district: "Chennai",
				taluk: "Chennai", 
				village: "Mylapore",
				pincode: "600004",
			},
			
			// Family Information
			fatherName: "Kumar Selvam",
			fatherOccupation: "Teacher",
			motherName: "Lakshmi Selvam",
			motherOccupation: "Homemaker",
			familyAnnualIncome: "350000",
			incomeCertificateNumber: "IC2024001234",
			parentMobileNumber: "9876543211",
			
			// Bank Information
			accountNumber: "30123456789",
			ifscCode: "SBIN0001234",
			bankName: "State Bank of India",
			bankBranch: "Mylapore Branch",
			bankAddress: "Luz Corner, Mylapore, Chennai - 600004",
			
			// Academic Information
			course: "B.E.",
			branchSpecialization: "Computer Science and Engineering",
			yearOfStudy: "1",
			academicYear: "2024-25",
			admissionDate: "2024-06-15",
			instituteName: "Anna University",
			instituteCode: "AU001",
			hosteler: "no",
		};

		const result1 = await this.runTest(
			'Student Registration API (Comprehensive)',
			'/umis-api/api/student/register',
			'POST',
			{
				body: JSON.stringify(comprehensiveData),
			}
		);
		results.push(result1);

		// Test 2: Minimal required data
		const minimalData = {
			emisAvailable: "no",
			studentNameCertificate: "Test Student",
			gender: "male",
			dateOfBirth: "2000-01-01",
			aadhaarNumber: "123456789012",
			mobileNumber: "9876543210",
		};

		const result2 = await this.runTest(
			'Student Registration API (Minimal)',
			'/umis-api/api/student/register',
			'POST',
			{
				body: JSON.stringify(minimalData),
			}
		);
		results.push(result2);

		return results;
	}

	// Test 5: Error Handling - Invalid Token
	async testInvalidTokenHandling(): Promise<TestResult> {
		const originalToken = this.token;
		this.token = 'invalid_token_12345';

		const result = await this.runTest(
			'Invalid Token Handling',
			'/umis-api/api/community/casteList/11',
			'GET'
		);

		// Restore original token
		this.token = originalToken;
		return result;
	}

	// Test 6: Network Error Simulation
	async testNetworkErrorHandling(): Promise<TestResult> {
		return await this.runTest(
			'Network Error Handling',
			'https://nonexistent-api-endpoint.invalid/test',
			'GET'
		);
	}

	// Run all tests
	async runAllTests(): Promise<TestReport> {
		console.log('🚀 Starting API Test Suite...');
		console.log('===============================');
		
		this.results = [];
		const startTime = Date.now();

		// Run authentication tests
		console.log('\n📝 Authentication Tests');
		await this.testTokenValidation();

		// Run API integration tests
		console.log('\n📝 API Integration Tests');
		const casteResults = await this.testCasteListAPI();
		const ifscResults = await this.testIFSCValidationAPI();
		const registrationResults = await this.testStudentRegistrationAPI();

		// Run error handling tests
		console.log('\n📝 Error Handling Tests');
		await this.testInvalidTokenHandling();
		await this.testNetworkErrorHandling();

		const totalTime = Date.now() - startTime;

		// Generate report
		const passed = this.results.filter(r => r.status === 'PASS').length;
		const failed = this.results.filter(r => r.status === 'FAIL').length;
		const skipped = this.results.filter(r => r.status === 'SKIP').length;

		const report: TestReport = {
			timestamp: new Date().toISOString(),
			totalTests: this.results.length,
			passed,
			failed,
			skipped,
			results: this.results,
		};

		console.log('\n📊 Test Results Summary');
		console.log('=======================');
		console.log(`Total Tests: ${report.totalTests}`);
		console.log(`✅ Passed: ${passed}`);
		console.log(`❌ Failed: ${failed}`);
		console.log(`⏭️ Skipped: ${skipped}`);
		console.log(`⏱️ Total Time: ${totalTime}ms`);
		
		if (failed > 0) {
			console.log('\n❌ Failed Tests:');
			this.results
				.filter(r => r.status === 'FAIL')
				.forEach(r => console.log(`  - ${r.testName}: ${r.error}`));
		}

		// Additional analysis for form submission
		const formTests = this.results.filter(r => r.testName.includes('Registration'));
		if (formTests.length > 0) {
			console.log('\n📋 Form Submission Analysis:');
			formTests.forEach(test => {
				console.log(`  - ${test.testName}: ${test.status} (${test.responseTime}ms)`);
				if (test.data) {
					console.log(`    Response: ${JSON.stringify(test.data).substring(0, 100)}...`);
				}
			});
		}

		return report;
	}

	// Generate detailed report
	generateDetailedReport(): string {
		const report = this.results.map(result => {
			return `
## ${result.testName}
- **Endpoint**: ${result.endpoint}
- **Method**: ${result.method}
- **Status**: ${result.status}
- **Response Time**: ${result.responseTime}ms
- **Status Code**: ${result.statusCode || 'N/A'}
${result.error ? `- **Error**: ${result.error}` : ''}
${result.data ? `- **Response Data**: \`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`` : ''}
			`.trim();
		}).join('\n\n');

		return `# API Test Report\n\n**Generated**: ${new Date().toISOString()}\n\n${report}`;
	}
}

// Global function to run tests from browser console
(window as any).runAPITests = async () => {
	const testSuite = new APITestSuite();
	const report = await testSuite.runAllTests();
	
	console.log('\n📄 Detailed Report:');
	console.log(testSuite.generateDetailedReport());
	
	return report;
};

// Export for TypeScript usage
export { APITestSuite };