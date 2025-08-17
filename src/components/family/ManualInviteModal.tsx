import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { WaveButton } from '../ui/WaveButton';
import { Typography } from '../ui/typography';

interface ManualInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inviteCode: string) => void;
}

export function ManualInviteModal({
  isOpen,
  onClose,
  onSubmit,
}: ManualInviteModalProps) {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      onSubmit(inviteCode.trim());
      setInviteCode('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <GlassCard variant="strong" className="relative w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography.H3 className="text-white">초대 코드 입력</Typography.H3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Typography.Body className="text-white/80 mb-2 block">
              가족 그룹 초대 코드를 입력해주세요
            </Typography.Body>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 코드를 입력하세요"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-400 transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <WaveButton
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </WaveButton>
            <WaveButton
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={!inviteCode.trim()}
            >
              가입하기
            </WaveButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}