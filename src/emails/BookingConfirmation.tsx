import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components';
import * as React from 'react';

type Props = {
  bookingRef: string;
  fullName: string;
  departureDate: string;
  returnDate: string;
  packageType: string;
  numGolfers: number;
  depositEur: string;
  balanceEur: string;
  balanceDueDate: string;
};

export function BookingConfirmation({
  bookingRef,
  fullName,
  departureDate,
  returnDate,
  packageType,
  numGolfers,
  depositEur,
  balanceEur,
  balanceDueDate,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your Golf Sol Ireland booking is confirmed — {bookingRef}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking confirmed</Heading>
          <Text style={text}>Hi {fullName},</Text>
          <Text style={text}>
            Your deposit has been received. Your booking reference is <strong>{bookingRef}</strong>.
          </Text>
          <Section style={box}>
            <Text style={label}>Dates</Text>
            <Text style={value}>{departureDate} – {returnDate}</Text>
            <Text style={label}>Package</Text>
            <Text style={value}>{packageType} · {numGolfers} golfers</Text>
            <Text style={label}>Deposit paid</Text>
            <Text style={value}>€{depositEur}</Text>
            <Text style={label}>Balance due (€{balanceEur}) by</Text>
            <Text style={value}>{balanceDueDate}</Text>
          </Section>
          <Text style={text}>
            Deposits are non-refundable except if cancelled within 48 hours of booking. Keep your booking ID for any changes or complaints.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Golf Sol Ireland · Costa del Sol golf holidays for Irish golfers</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#f6f6f6', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '24px', maxWidth: '560px' };
const h1 = { color: '#123811', fontSize: '24px', marginBottom: '16px' };
const text = { color: '#333', fontSize: '16px', lineHeight: '24px', margin: '0 0 16px' };
const box = { backgroundColor: '#e8f0e9', padding: '16px', borderRadius: '8px', margin: '24px 0' };
const label = { color: '#2d6b3a', fontSize: '12px', textTransform: 'uppercase' as const, margin: '0 0 4px' };
const value = { color: '#333', fontSize: '16px', margin: '0 0 12px' };
const hr = { borderColor: '#e0e0e0', margin: '24px 0' };
const footer = { color: '#888', fontSize: '12px' };

export default BookingConfirmation;
