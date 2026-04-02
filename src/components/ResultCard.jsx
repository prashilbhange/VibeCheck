import { memo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ResultCard({ title, eyebrow, children, testId, className = "" }) {
  return (
    <Card
      className={`glass-card rounded-[30px] border-white/10 bg-white/[0.05] shadow-[0_0_60px_rgba(0,0,0,0.18)] ${className}`}
      data-testid={testId}
    >
      <CardHeader className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/[0.42]">{eyebrow}</p>
        <CardTitle className="font-display text-2xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default memo(ResultCard);