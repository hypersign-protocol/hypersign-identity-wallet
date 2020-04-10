import { registerModal } from '../../store/plugins/modals';
import DefaultModal from './components/Modals/DefaultModal';
import TipVerifiedModal from './components/Modals/TipVerifiedModal';
import ClaimSuccessModal from './components/Modals/ClaimSuccessModal';
import TipBadgeModal from './components/Modals/TipBadgeModal';
import ConfirmTip from './components/Modals/ConfirmTip';

export default async () => {
  registerModal({ name: 'default', component: DefaultModal });
  registerModal({ name: 'tip-verified', component: TipVerifiedModal });
  registerModal({ name: 'claim-success', component: ClaimSuccessModal });
  registerModal({ name: 'tip-badge', component: TipBadgeModal });
  registerModal({ name: 'confirm-tip', component: ConfirmTip });
};
