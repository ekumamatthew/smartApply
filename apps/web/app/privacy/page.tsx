import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - SwiftApplyHQ",
  description:
    "Learn how SwiftApplyHQ protects your privacy and handles your data.",
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              SwiftApplyHQ (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our AI-powered job application assistant
              service.
            </p>
            <p>
              By using SwiftApplyHQ, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Personal Information</h3>
              <ul className="list-disc space-y-1 pl-6">
                <li>Name and email address</li>
                <li>Phone number (optional)</li>
                <li>LinkedIn profile (optional)</li>
                <li>Professional summary (optional)</li>
                <li>Country information</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Professional Documents</h3>
              <ul className="list-disc space-y-1 pl-6">
                <li>CV/Resume files and content</li>
                <li>Job descriptions you provide</li>
                <li>Generated application emails</li>
                <li>CV optimization results</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Usage and Technical Data</h3>
              <ul className="list-disc space-y-1 pl-6">
                <li>Service usage patterns and credits consumed</li>
                <li>Device and browser information (for compatibility)</li>
                <li>Authentication tokens and session data</li>
                <li>Essential cookies for site functionality</li>
                <li>Performance and error monitoring data</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Payment Information</h3>
              <ul className="list-disc space-y-1 pl-6">
                <li>Credit purchase history</li>
                <li>Payment processing data (handled by Flutterwave)</li>
                <li>Transaction records and receipts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Service Delivery:</strong> To provide AI-powered job
                application assistance, CV optimization, and email generation
              </li>
              <li>
                <strong>Account Management:</strong> To create and manage your
                account, authenticate users, and provide customer support
              </li>
              <li>
                <strong>Payment Processing:</strong> To process credit purchases
                and manage billing transactions
              </li>
              <li>
                <strong>Service Improvement:</strong> To analyze usage patterns,
                improve our AI models, and enhance user experience
              </li>
              <li>
                <strong>Communication:</strong> To send transactional emails,
                service updates, and support responses
              </li>
              <li>
                <strong>Security:</strong> To detect fraud, maintain security,
                and comply with legal obligations
              </li>
              <li>
                <strong>Analytics:</strong> To understand how our service is
                used and make data-driven improvements
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI and Data Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              SwiftApplyHQ uses artificial intelligence to analyze your CV and
              job descriptions to generate tailored application materials.
              Here's how we handle your data in this process:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Your CV and job descriptions are processed by AI models to
                extract relevant information
              </li>
              <li>
                Generated content is based on patterns in your provided
                materials
              </li>
              <li>
                We do not sell your personal data or use it to train third-party
                AI models
              </li>
              <li>
                AI processing is conducted with appropriate security measures in
                place
              </li>
              <li>
                You maintain ownership of all your original content and
                generated materials
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We do not sell your personal information. We only share your data
              in the following circumstances:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Service Providers:</strong> With trusted third-party
                services that help us operate our business (e.g., Flutterwave
                for payments, cloud storage providers)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court
                order, or government regulation
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with mergers,
                acquisitions, or sales of business assets
              </li>
              <li>
                <strong>Safety and Security:</strong> To protect our rights,
                property, or safety, or that of our users
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement industry-standard security measures to protect your
              information:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and session management</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and employee training on data protection</li>
              <li>Secure cloud storage with appropriate safeguards</li>
            </ul>
            <p>
              However, no method of transmission over the internet is 100%
              secure. While we strive to protect your data, we cannot guarantee
              absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We retain your information for as long as necessary to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Fulfill the purposes for which it was collected</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our agreements</li>
              <li>Maintain security and prevent fraud</li>
            </ul>
            <p>
              You may request deletion of your account and personal data at any
              time through your account settings or by contacting us. We will
              delete your information unless we are required to retain it for
              legal or legitimate business purposes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Access:</strong> Request access to your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Portability:</strong> Request a copy of your data in a
                portable format
              </li>
              <li>
                <strong>Restriction:</strong> Limit how we process your
                information
              </li>
              <li>
                <strong>Objection:</strong> Object to certain processing of your
                information
              </li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information
              provided below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              SwiftApplyHQ may process and store your information in countries
              other than your own. When we transfer your data internationally,
              we ensure appropriate safeguards are in place to protect your
              privacy in accordance with applicable data protection laws.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our service is not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children
              under 18. If we become aware that we have collected information
              from a child under 18, we will take steps to delete such
              information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the &quot;Last updated&quot; date. Material changes
              may also be communicated via email or other prominent notices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have any questions about this Privacy Policy or want to
              exercise your rights, please contact us:
            </p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> privacy@swiftapplyhq.com
              </p>
              <p>
                <strong>Website:</strong> https://swiftapplyhq.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
