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
import type { SessionMetadata } from '@/shared/types/session-metadata.types';
interface PasswordRecoveryTemplateProps {
  domain: string;
  token: string;
  metadata: SessionMetadata;
}

export const PasswordRecoveryTemplate = ({
  domain,
  token,
  metadata,
}: PasswordRecoveryTemplateProps) => {
  const resetLink = `${domain}/account/recovery/${token}`;
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center mb-8">
            <Heading className="text-3xl text-black font-bold">
              Reset your password
            </Heading>
            <Text className="text-base text-black">
              Click the link below to reset your password
            </Text>
            <Link
              href={resetLink}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600"
            >
              Reset password
            </Link>
          </Section>

          <Section className="bg-gray-100 p-6 text-center mb-6 rounded-lg">
            <Heading className="text-xl font-semibold text-indigo-600">
              Request information
            </Heading>
            <ul className="list-disc list-inside mt-2">
              <li>Location: {metadata.location.country}</li>
              <li>OS: {metadata.device.os}</li>
              <li>Browser: {metadata.device.browser}</li>
              <li>IP: {metadata.ip}</li>
            </ul>
            <Text className="text-gray-600 mt-2">
              If you did not request this, you can safely ignore this email
            </Text>
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
