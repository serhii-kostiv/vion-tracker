import * as React from 'react';
import {
  Html,
  Body,
  Heading,
  Head,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';
interface VerificationTemplateProps {
  domain: string;
  token: string;
}

export const VerificationTemplate = ({
  domain,
  token,
}: VerificationTemplateProps) => {
  const verificationLink = `${domain}/account/verify?token=${token}`;
  return (
    <Html>
      <Head />
      <Preview>Verify your email</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center mb-8">
            <Heading className="text-3xl text-black font-bold">
              Verify your email
            </Heading>
            <Text className="text-base text-black">
              Click the link below to verify your email address
            </Text>
            <Link
              href={verificationLink}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600"
            >
              Verify email
            </Link>
          </Section>

          <Section className="text-center mt-8">
            <Text className="text-sm text-black">
              If you did not request this, you can safely ignore this email
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
};
