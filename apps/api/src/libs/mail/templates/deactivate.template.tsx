import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';
import type { SessionMetadata } from '@/shared/types/session-metadata.types';

interface DeactivateTemplateProps {
  token: string;
  metadata: SessionMetadata;
}

export function DeactivateTemplate({
  token,
  metadata,
}: DeactivateTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Deactivate account</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center mb-8">
            <Heading className="text-3xl text-black font-bold">
              Request for account deactivation
            </Heading>
            <Text className="text-black text-base mt-2">
              You have initiated the process of deactivating your account on the{' '}
              <b>VionLink</b>.
            </Text>
          </Section>

          <Section className="bg-gray-100 rounded-lg p-6 text-center mb-6">
            <Heading className="text-2xl text-black font-semibold">
              Deactivation code:
            </Heading>
            <Heading className="text-3xl text-black font-semibold">
              {token}
            </Heading>
            <Text className="text-black">
              This code will be valid for 5 minutes.
            </Text>
          </Section>

          <Section className="bg-gray-100 rounded-lg p-6 mb-6">
            <Heading className="text-xl font-semibold text-[#18B9AE]">
              Session metadata:
            </Heading>
            <ul className="list-disc list-inside text-black mt-2">
              <li>
                🌍 Location: {metadata.location.country},{' '}
                {metadata.location.city}
              </li>
              <li>📱 OS: {metadata.device.os}</li>
              <li>🌐 Browser: {metadata.device.browser}</li>
              <li>💻 IP: {metadata.ip}</li>
            </ul>
            <Text className="text-gray-600 mt-2">
              If you did not initiate this request, please ignore this message.
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
