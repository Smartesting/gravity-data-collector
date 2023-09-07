import { TargetedUserAction, UserAction } from '../types';
export default function isTargetedUserAction(userAction: UserAction): userAction is TargetedUserAction;
