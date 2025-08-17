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