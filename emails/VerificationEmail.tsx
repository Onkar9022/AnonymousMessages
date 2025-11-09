import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
  // optional link if user wants to resend
}

export default function VerificationEmail({
  username,
  otp,
  
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
            format: "woff2",
          }}
        />
      </Head>
      <Preview>Your verification code is inside this email</Preview>

      <Section style={{ padding: "24px", backgroundColor: "#f9f9f9" }}>
        <Row>
          <Heading
            as="h2"
            style={{
              fontSize: "22px",
              marginBottom: "16px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Hello {username},
          </Heading>
        </Row>

        <Row>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Use the following verification code to complete your sign-in:
          </Text>
        </Row>

        <Row>
          <Text
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              letterSpacing: "4px",
              textAlign: "center",
              margin: "20px 0",
              color: "#2563eb",
            }}
          >
            {otp}
          </Text>
        </Row>

        <Row>
          <Text style={{ fontSize: "14px", marginBottom: "20px" }}>
            This code will expire in 10 minutes. If you didn’t request this,
            please ignore this email.
          </Text>
        </Row>

        {/* {resendUrl && (
          <Row style={{ textAlign: "center" }}>
            <Button
              href={resendUrl}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Resend Code
            </Button>
          </Row>
        )} */}
      </Section>

      <Section style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
        <Text>© {new Date().getFullYear()} Onkar Patil . All rights reserved.</Text>
      </Section>
    </Html>
  );
}
