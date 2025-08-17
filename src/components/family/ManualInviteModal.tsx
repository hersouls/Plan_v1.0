import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { WaveButton } from '../ui/WaveButton';
import { Typography } from '../ui/typography';

interface ManualInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (inviteCode: string) => void;
}

export function ManualInviteModal({
  isOpen,
  onClose,
  onScanSuccess,
}: ManualInviteModalProps) {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      onScanSuccess(inviteCode.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <GlassCard className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <Typography.H3 className="text-white mb-2">초대 코드 입력</Typography.H3>
          <Typography.Body className="text-white/80">
            가족 그룹 초대 코드를 입력하세요
          </Typography.Body>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 코드를 입력하세요"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
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
            >
              가입하기
            </WaveButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}