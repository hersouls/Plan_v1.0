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
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <GlassCard variant="medium" className="p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <Typography.H3 className="text-white mb-2">수동 초대</Typography.H3>
          <Typography.Body className="text-white/80">
            초대 코드를 입력하여 가족 그룹에 가입하세요
          </Typography.Body>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 코드를 입력하세요"
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