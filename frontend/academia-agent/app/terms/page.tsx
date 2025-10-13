import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Terms of Service & Privacy Policy</CardTitle>
          <CardDescription>
            Last updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-sm text-muted-foreground">
              Welcome to Academia Agent, operated by Eight Twelve Consulting LLC
              ("we," "us," or "our"). By accessing or using our service, you
              agree to be bound by these Terms of Service and our Privacy
              Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Data Collection and Use</h2>
            <p className="text-sm text-muted-foreground mb-2">
              When you sign up for Academia Agent, we collect your email address
              for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>To authenticate your account and provide access to our services</li>
              <li>To send you service-related communications</li>
              <li>
                <strong>To send you marketing communications from Eight Twelve Consulting LLC</strong> (only after you opt-in during sign-up)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Marketing Communications</h2>
            <p className="text-sm text-muted-foreground mb-2">
              By checking the terms and conditions box during sign-up, you
              explicitly consent to receive marketing emails from Eight Twelve
              Consulting LLC. These may include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Product updates and new feature announcements</li>
              <li>Educational content and resources</li>
              <li>Promotional offers and special events</li>
              <li>Newsletters and industry insights</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              You may opt out of marketing communications at any time by clicking
              the "unsubscribe" link in any marketing email or by contacting us
              directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Protection</h2>
            <p className="text-sm text-muted-foreground">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. Your email address is
              stored securely and is only accessible to authorized personnel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
            <p className="text-sm text-muted-foreground">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only in the following
              circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or valid legal processes</li>
              <li>
                With service providers who assist us in operating our platform
                (under strict confidentiality agreements)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-sm text-muted-foreground mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Withdraw your consent to data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h2>
            <p className="text-sm text-muted-foreground">
              We use essential cookies to maintain your session and ensure the
              proper functioning of our service. We do not use third-party
              tracking cookies without your consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
            <p className="text-sm text-muted-foreground">
              Our service is not intended for children under the age of 13. We do
              not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground">
              We may update these terms and privacy policy from time to time. We
              will notify you of any material changes by email or through a
              prominent notice on our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
            <p className="text-sm text-muted-foreground">
              If you have any questions about these Terms of Service or our
              Privacy Policy, please contact Eight Twelve Consulting LLC at:
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Email: privacy@eighttwelve.consulting
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground">
              Academia Agent is provided "as is" without warranties of any kind.
              Eight Twelve Consulting LLC shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages resulting
              from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
            <p className="text-sm text-muted-foreground">
              These terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Eight Twelve Consulting LLC
              operates, without regard to its conflict of law provisions.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
