import React from "react";

export const VerticalGradient = ({
  id,
  color,
}: {
  id: string;
  color: string;
}) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity={0.9} />
    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
  </linearGradient>
);

export const HorizontalGradient = ({
  id,
  color,
}: {
  id: string;
  color: string;
}) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
    <stop offset="50%" stopColor={color} stopOpacity={1} />
    <stop offset="100%" stopColor={color} stopOpacity={0.8} />
  </linearGradient>
);
