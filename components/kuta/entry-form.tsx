"use client";

import { useState } from "react";
import { Coffee, CupSoda, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DEFAULT_DRINK, DRINKS, drinkLabel } from "@/config/drinks";
import type { DrinkOption } from "@/config/drinks";
import type { DrinkId, Participant } from "@/types/kuta";

const DRINK_ICONS: Record<DrinkOption["icon"], typeof Coffee> = {
  Coffee,
  CupSoda,
  Leaf,
};

export function EntryForm({
  roomName = "팀 커타방",
  onJoin,
}: {
  roomName?: string;
  onJoin: (participant: Participant) => void;
}) {
  const [name, setName] = useState("");
  const [drink, setDrink] = useState<DrinkId>(DEFAULT_DRINK);

  const trimmed = name.trim();
  const canJoin = trimmed.length > 0;

  function submit() {
    if (!canJoin) return;
    onJoin({ name: trimmed, drink });
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <Coffee className="size-7 text-muted-foreground" />
        </div>
        <CardTitle>☕ {roomName}</CardTitle>
        <CardDescription>링크로 초대된 방 · 이름만 넣고 참여하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="kuta-name">이름</FieldLabel>
              <Input
                id="kuta-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                autoComplete="off"
              />
            </Field>

            <Field>
              <FieldLabel id="kuta-drink-label">오늘 마실 음료</FieldLabel>
              <ToggleGroup
                type="single"
                value={drink}
                onValueChange={(value) => value && setDrink(value as DrinkId)}
                variant="outline"
                aria-labelledby="kuta-drink-label"
                className="flex-wrap"
              >
                {DRINKS.map((d) => {
                  const Icon = DRINK_ICONS[d.icon];
                  return (
                    <ToggleGroupItem key={d.id} value={d.id}>
                      <Icon data-icon="inline-start" />
                      {d.label}
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            </Field>
          </FieldGroup>

          {/* 내 아바타 미리보기 — 고른 음료가 컵에 반영 (FR-2) */}
          <div className="mt-5 flex items-center gap-3 rounded-lg bg-muted p-3">
            <div className="flex size-10 items-center justify-center rounded border">
              <Coffee className="size-5 text-muted-foreground" />
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">내 아바타 미리보기</p>
              <p aria-live="polite">{drinkLabel(drink)} 컵을 들고 있어요</p>
            </div>
          </div>

          <Button type="submit" disabled={!canJoin} className="mt-6 w-full">
            커타 참여
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
