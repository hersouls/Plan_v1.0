import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { WaveButton } from '../ui/WaveButton';
import { Typography } from '../ui/typography';

interface ManualInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (inviteCode: string) => void;
}

export function ManualInviteModal({
  isOpen,
  onClose,
  onInvite,
}: ManualInviteModalProps) {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      onInvite(inviteCode.trim());
      setInviteCode('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography.H4 className="text-white font-pretendard">
            초대 코드 입력
          </Typography.H4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Typography.Label className="text-white/90 mb-2 block">
              초대 코드
            </Typography.Label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 코드를 입력하세요"
              className="w-full px-4 py-3 border-2 rounded-xl bg-background/95 backdrop-blur-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-400/30 focus:border-primary-400"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <WaveButton
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </WaveButton>
            <WaveButton
              type="submit"
              disabled={!inviteCode.trim()}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              가입하기
            </WaveButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}