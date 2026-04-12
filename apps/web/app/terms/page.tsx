import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - SwiftApplyHQ",
  description: "Read SwiftApplyHQ's terms of service and user agreement.",
}

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to SwiftApplyHQ. These Terms of Service
              (&quot;Terms&quot;) govern your use of our AI-powered job
              application assistant service and constitute a legally binding
              agreement between you and SwiftApplyHQ (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p>
              By accessing or using SwiftApplyHQ, you agree to be bound by these
              Terms. If you disagree with any part of these terms, then you may
              not access the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              SwiftApplyHQ is an AI-powered platform that helps job seekers
              create tailored application materials. Our services include:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>CV analysis and optimization</li>
              <li>AI-generated application emails</li>
              <li>Job description analysis</li>
              <li>Professional document enhancement</li>
              <li>Credits-based usage system</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue the
              Service at any time without notice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Registration and Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To use our Service, you must create an account and provide
              accurate, complete information. You are responsible for:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Maintaining the confidentiality of your account credentials
              </li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate and up-to-date information</li>
            </ul>
            <p>
              You must be at least 18 years old to create an account. We reserve
              the right to suspend or terminate accounts that violate these
              Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits and Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>SwiftApplyHQ operates on a credits-based system:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Credits are purchased in packages with real money</li>
              <li>Credits are consumed when using AI-powered features</li>
              <li>
                Credit costs vary by feature (CV parsing, email generation,
                etc.)
              </li>
              <li>Credits are non-refundable except as required by law</li>
              <li>Credits do not expire unless specified otherwise</li>
            </ul>
            <p>
              We use Flutterwave as our payment processor. By purchasing
              credits, you agree to Flutterwave&apos;s terms of conditions. All
              prices are displayed in your selected currency with applicable
              taxes included.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You agree to use our Service only for lawful purposes and in
              accordance with these Terms. You may not:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Use the Service to create fraudulent or misleading job
                applications
              </li>
              <li>Submit false or inaccurate information</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>
                Use the Service to violate any applicable laws or regulations
              </li>
              <li>
                Reverse engineer, decompile, or attempt to extract our source
                code
              </li>
              <li>
                Use automated tools to access the Service without permission
              </li>
              <li>Resell or redistribute access to the Service</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Our Content</h3>
              <p>
                SwiftApplyHQ and its licensors own all rights, title, and
                interest in and to the Service, including software, text,
                graphics, logos, and other materials. You may not use our
                intellectual property without our prior written consent.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Your Content</h3>
              <p>
                You retain ownership of all content you submit to our Service,
                including your CV, job descriptions, and generated materials. By
                using our Service, you grant us a limited, non-exclusive license
                to use your content solely to provide and improve our services.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Generated Content</h3>
              <p>
                Content generated by our AI models is based on your input and
                remains your property. However, you acknowledge that
                AI-generated content may not be unique and should be reviewed
                and customized before use.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Content Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our Service uses artificial intelligence to generate content. You
              acknowledge and agree that:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>AI-generated content may contain inaccuracies or errors</li>
              <li>
                Generated content should be reviewed and edited before
                submission
              </li>
              <li>
                We are not responsible for the outcomes of using generated
                content
              </li>
              <li>AI models may produce similar content for different users</li>
              <li>
                You are solely responsible for the final application materials
                you submit
              </li>
            </ul>
            <p>
              We do not guarantee that use of our Service will result in job
              offers or employment opportunities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your privacy is important to us. Our collection and use of
              personal information is governed by our Privacy Policy, which
              forms part of these Terms. By using our Service, you consent to
              the collection and use of your information as described in our
              Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Availability and Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We strive to maintain high service availability but cannot
              guarantee uninterrupted access. The Service may be temporarily
              unavailable due to maintenance, technical issues, or factors
              beyond our control.
            </p>
            <p>
              Customer support is provided via email and our help documentation.
              Response times may vary based on inquiry volume and complexity.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You may terminate your account at any time through your account
              settings or by contacting us. We may suspend or terminate your
              account for:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Violation of these Terms</li>
              <li>Suspicious or fraudulent activity</li>
              <li>Extended period of inactivity</li>
              <li>Legal or regulatory requirements</li>
            </ul>
            <p>
              Upon termination, your right to use the Service ceases
              immediately. We may delete your account and data, though we may
              retain certain information as required by law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disclaimers and Limitations of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF
              ANY KIND. WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
              LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
            <p>
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING
              TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID FOR CREDITS IN
              THE SIX MONTHS PRECEDING THE CLAIM.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You agree to indemnify, defend, and hold harmless SwiftApplyHQ and
              its officers, directors, employees, and agents from and against
              any and all claims, liabilities, damages, losses, and expenses,
              including reasonable attorneys&apos; fees, arising from or in any
              way related to your use of the Service or violation of these
              Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governing Law and Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction where SwiftApplyHQ operates, without
              regard to conflict of law principles.
            </p>
            <p>
              Any disputes arising from these Terms or your use of the Service
              shall be resolved through good faith negotiations. If unresolved,
              disputes may be resolved through binding arbitration in accordance
              with applicable arbitration rules.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to modify these Terms at any time. Changes
              will be effective immediately upon posting. We will notify users
              of material changes via email or prominent notices on our
              platform. Your continued use of the Service after such changes
              constitutes acceptance of the modified Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General Provisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Entire Agreement:</strong> These Terms constitute the
                entire agreement between you and SwiftApplyHQ
              </li>
              <li>
                <strong>Severability:</strong> If any provision is found
                invalid, the remaining provisions remain enforceable
              </li>
              <li>
                <strong>No Waiver:</strong> Failure to enforce any provision
                does not waive our right to enforce it later
              </li>
              <li>
                <strong>Assignment:</strong> You may not assign your rights or
                obligations without our consent
              </li>
              <li>
                <strong>Notices:</strong> We may send notices via email or
                through the Service
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>If you have questions about these Terms, please contact us:</p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> legal@swiftapplyhq.com
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
