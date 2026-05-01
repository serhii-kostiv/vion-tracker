import * as React from 'react';
import {
  Body,
  Head,
  Heading,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  Html,
} from 'react-email';

interface AccountDeletionTemplateProps {
  domain: string;
}

export function AccountDeletionTemplate({
  domain,
}: AccountDeletionTemplateProps) {
  const registerLink = `${domain}/account/create`;

  return (
    <Html>
      <Head />
      <Preview>Account deleted</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center">
            <Heading className="text-3xl text-black font-bold">
              Your account has been deleted
            </Heading>
            <Text className="text-base text-black mt-2">
              Your account has been deleted from the database. All your data and
              information were deleted permanently.
            </Text>
          </Section>

          <Section className="bg-white text-black text-center rounded-lg shadow-md p-6 mb-4">
            <Text>
              If you want to return to the platform, you can register again
              using the following link:
            </Text>
            <Link
              href={registerLink}
              className="inline-flex justify-center items-center rounded-md mt-2 text-sm font-medium text-white bg-[#18B9AE] px-5 py-2 rounded-full"
            >
              Register on VionTracker
            </Link>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
