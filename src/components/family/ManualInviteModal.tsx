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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <GlassCard className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <Typography variant="h3">초대 코드 입력</Typography>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 코드를 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <WaveButton
              type="button"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </WaveButton>
            <WaveButton
              type="submit"
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