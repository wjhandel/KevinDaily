/**
 * Lucide 图标名称 ↔ 组件 映射
 * PocketBase 存储 iconName (string)，前端渲染用 Lucide 组件
 */
import {
  Sun, Dumbbell, BookOpen, Languages, GraduationCap,
  Gamepad2, Pizza, Ticket, Gift, Coffee,
  Stars, Music, Brush, Heart, Smile, Trophy,
  BedDouble, Lightbulb, Plane, Shirt, Utensils,
  WashingMachine, Bath, TreePine, Zap, Target, Sparkles,
  Mic, Camera, Star, Rocket, Send, CheckCircle2,
  Flame, Home, Calculator, CheckCircle, Award, Activity,
} from 'lucide-react';

export const ICON_MAP: Record<string, any> = {
  Sun, Dumbbell, BookOpen, Languages, GraduationCap,
  Gamepad2, Pizza, Ticket, Gift, Coffee,
  Stars, Music, Brush, Heart, Smile, Trophy,
  BedDouble, Lightbulb, Plane, Shirt, Utensils,
  WashingMachine, Bath, TreePine, Zap, Target, Sparkles,
  Mic, Camera, Star, Rocket, Send, CheckCircle2,
  Flame, Home, Calculator, CheckCircle, Award, Activity,
};

/** 从字符串名称获取 Lucide 组件 */
export function getIconComponent(name: string | null | undefined): any {
  if (!name) return Sun;
  return ICON_MAP[name] || Sun;
}

/** 反向查找：用组件实例找名称（仅用于已有组件时） */
export function getIconName(component: any): string {
  if (!component) return 'Sun';
  for (const [name, comp] of Object.entries(ICON_MAP)) {
    if (comp === component) return name;
  }
  return 'Sun';
}
