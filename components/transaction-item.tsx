import {Text} from '@/components/text';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {router} from 'expo-router';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';

type MDIName = keyof typeof MaterialCommunityIcons.glyphMap;

// Minimal shape this component needs — compatible with the store's Transaction.
export interface TransactionItemData {
	id: number;
	attributes: {
		servicename: string;
		servicedesc: string;
		amount: string;
		status: number;
		oldbal: string;
		newbal: string;
		date: string | null;
	};
}

const MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

// "2026-08-15 09:15:55" -> "15 Aug 2026, 09:15". Parsed manually to avoid
// platform Intl/timezone quirks.
const formatDate = (date?: string | null) => {
	if (!date) return '';
	const [datePart, timePart] = date.split(' ');
	const [y, m, d] = datePart.split('-');
	const hm = timePart?.slice(0, 5) ?? '';
	const month = MONTHS[Number(m) - 1] ?? m;
	return `${d} ${month} ${y}${hm ? `, ${hm}` : ''}`;
};

const formatTime = (date?: string | null) =>
	date ? (date.split(' ')[1]?.slice(0, 5) ?? '') : '';

// Group transactions (already sorted newest-first) into day sections with
// friendly labels (Today / Yesterday / "15 Aug 2026").
export const groupTransactionsByDay = (items: TransactionItemData[]) => {
	const pad = (n: number) => String(n).padStart(2, '0');
	const keyOf = (d: Date) =>
		`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);
	const todayKey = keyOf(today);
	const yesterdayKey = keyOf(yesterday);

	const labelFor = (key: string) => {
		if (!key) return 'Earlier';
		if (key === todayKey) return 'Today';
		if (key === yesterdayKey) return 'Yesterday';
		const [y, m, d] = key.split('-');
		return `${Number(d)} ${MONTHS[Number(m) - 1] ?? m} ${y}`;
	};

	const groups: {key: string; label: string; items: TransactionItemData[]}[] =
		[];
	for (const t of items) {
		const key = (t.attributes.date ?? '').slice(0, 10);
		let group = groups[groups.length - 1];
		if (!group || group.key !== key) {
			group = {key, label: labelFor(key), items: []};
			groups.push(group);
		}
		group.items.push(t);
	}
	return groups;
};

// Icon + accent colour per service category. Matched loosely on the name so new
// service labels still land on a sensible icon (falling back to a swap glyph).
const visualFor = (name: string): {icon: MDIName; bg: string; fg: string} => {
	const n = name.toLowerCase();
	if (n.includes('airtime'))
		return {icon: 'cellphone', bg: '#EDE9FE', fg: '#7C3AED'};
	if (n.includes('data')) return {icon: 'wifi', bg: '#E0F2FE', fg: '#0284C7'};
	if (n.includes('epin'))
		return {icon: 'ticket-confirmation-outline', bg: '#FEF3C7', fg: '#D97706'};
	if (n.includes('exam'))
		return {icon: 'school-outline', bg: '#E0E7FF', fg: '#4F46E5'};
	if (n.includes('electric'))
		return {icon: 'lightning-bolt', bg: '#FEF9C3', fg: '#CA8A04'};
	if (n.includes('cable') || n.includes('tv'))
		return {icon: 'television-classic', bg: '#FCE7F3', fg: '#DB2777'};
	if (n.includes('bet')) return {icon: 'soccer', bg: '#DCFCE7', fg: '#16A34A'};
	if (n.includes('withdraw'))
		return {icon: 'bank-transfer-out', bg: '#FEE2E2', fg: '#DC2626'};
	if (n.includes('transfer'))
		return {icon: 'bank-transfer', bg: '#E0E7FF', fg: '#4F46E5'};
	if (n.includes('refund'))
		return {icon: 'cash-refund', bg: '#CCFBF1', fg: '#0D9488'};
	if (n.includes('topup') || n.includes('credit'))
		return {icon: 'cash-plus', bg: '#DCFCE7', fg: '#16A34A'};
	if (n.includes('debit'))
		return {icon: 'cash-minus', bg: '#FEE2E2', fg: '#DC2626'};
	return {icon: 'swap-horizontal', bg: '#EEF1FA', fg: '#3D4B66'};
};

// Status mapping. In the sample data, status 0 and 1 are both completed
// transactions (1 appears on successful refunds / Paystack top-ups), so both
// read "Successful". 2 -> Failed, 3 -> Pending. Adjust here if the backend
// enum differs.
const statusInfo = (status: number) => {
	switch (status) {
		case 2:
			return {label: 'Failed', color: '#DC2626', bg: '#FEE2E2'};
		case 3:
			return {label: 'Pending', color: '#B7791F', bg: '#FEF3C7'};
		default:
			return {label: 'Successful', color: '#16A34A', bg: '#DCFCE7'};
	}
};

const formatAmount = (amount: string) =>
	Number(amount).toLocaleString('en-NG', {maximumFractionDigits: 2});

interface Props {
	transaction: TransactionItemData;
	// 'list' — full page (description + time, hairline divider).
	// 'compact' — home recent list (full date, no divider).
	variant?: 'list' | 'compact';
}

const TransactionItem = ({transaction, variant = 'list'}: Props) => {
	const a = transaction.attributes;
	// Direction from the ledger balances: money in vs money out.
	const isCredit = Number(a.newbal) - Number(a.oldbal) > 0;
	const v = visualFor(a.servicename);
	const st = statusInfo(a.status);
	const abnormal = a.status === 2 || a.status === 3;

	const leftSecondary = variant === 'list' ? a.servicedesc : formatDate(a.date);

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={() => router.push(`/TransactionDetails?id=${transaction.id}`)}
			className={`flex-row items-center ${variant === 'list' ? 'pb-5' : 'py-3'}`}
		>
			<View
				style={{backgroundColor: v.bg}}
				className="w-12 h-12 rounded-2xl items-center justify-center"
			>
				<MaterialCommunityIcons name={v.icon} size={24} color={v.fg} />
			</View>

			<View className="flex-1 ml-2">
				<Text
					className="font-semibold text-[#0F172A] text-[15px]"
					numberOfLines={1}
				>
					{a.servicename}
				</Text>
				{leftSecondary ? (
					<Text className="text-[#94A3B8] text-xs mt-1" numberOfLines={1}>
						{leftSecondary}
					</Text>
				) : null}
			</View>

			<View className="items-end ml-2">
				<Text
					className={`font-bold text-[15px] ${
						isCredit ? 'text-[#16A34A]' : 'text-[#0F172A]'
					}`}
				>
					{isCredit ? '+' : '-'}₦{formatAmount(a.amount)}
				</Text>
				{abnormal ? (
					<View
						style={{backgroundColor: st.bg}}
						className="mt-1 px-2 py-0.5 rounded-full"
					>
						<Text
							className="text-[10px] font-semibold"
							style={{color: st.color}}
						>
							{st.label}
						</Text>
					</View>
				) : variant === 'list' ? (
					<Text className="text-[#B8C0CC] text-[11px] mt-1">
						{formatTime(a.date)}
					</Text>
				) : null}
			</View>
		</TouchableOpacity>
	);
};

export default TransactionItem;
