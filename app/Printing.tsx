import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {globalStyles} from '@/styles';
import {AxiosClient} from '@/utils/axios';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {useQuery} from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import {router} from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, {useState} from 'react';
import {
	Keyboard,
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {networkProvidersIcon} from './(tabs)/airtime';
import Button from './components/button';
import PinModal from './components/PinModal';
import {NETWORK_ICON_DATA_URIS} from './network-icons-data-uris';

interface PriceDiscount {
	amount: number;
	payable: number;
}

interface NetworkDiscount {
	network: string;
	network_id: string;
	prices: PriceDiscount[];
}

interface EPinDiscountsResponse {
	status: number;
	message: string;
	data: {
		discounts: NetworkDiscount[];
	};
}

interface EPinCard {
	transactionid: string;
	transactiondate: string;
	batchno: string;
	mobilenetwork: string;
	sno: string;
	pin: string;
	amount: string;
}

interface EPinPrintResponse {
	status: number;
	message: string;
	data: {
		transaction_ref: string;
		nellobytes_ref: string;
		amount: number;
		balance: number;
		data: {
			TXN_EPIN: EPinCard[];
		};
	};
}

interface EPinHistoryRecord {
	id: number;
	network: string;
	amount: string;
	pin_code: string;
	serial_number: string;
	status: string;
	description: string;
	created_at: string;
	transaction_id: number;
}

interface EPinHistoryResponse {
	status: number;
	message: string;
	data: {
		current_page: number;
		data: EPinHistoryRecord[];
		last_page: number;
		next_page_url: string | null;
		prev_page_url: string | null;
		total: number;
	};
}

const getDialCode = (network: string, pin: string) => {
	return `*311*${pin}#`;
};

const Printing = () => {
	const {setLoading} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [formData, setFormData] = useState({
		network: '',
		id: '',
		quantity: '',
		amount: 0,
	});
	const [showNetworkModal, setShowNetworkModal] = useState(false);
	const [showAmountModal, setShowAmountModal] = useState(false);
	const [ePinCards, setEPinCards] = useState<EPinCard[]>([]);
	const [showHistory, setShowHistory] = useState(false);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [history, setHistory] = useState<EPinHistoryRecord[]>([]);
	const [selectedRecord, setSelectedRecord] =
		useState<EPinHistoryRecord | null>(null);

	const fetchHistory = async () => {
		try {
			setHistoryLoading(true);
			const axiosClient = new AxiosClient();
			const response = await axiosClient.get<EPinHistoryResponse>(
				'/v1/nellobytes/epin/history',
			);
			if (response.status === 200) {
				setHistory(response.data.data.data);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setHistoryLoading(false);
		}
	};

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.network) {
				throw new Error('Please select a network');
			} else if (!formData.quantity) {
				throw new Error('Please input quantity');
			} else if (!formData.amount) {
				throw new Error('Please select amount');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<
				{
					mobile_network: string;
					value: number;
					quantity: string;
					pin: string;
				},
				EPinPrintResponse
			>('/v1/nellobytes/epin/buy', {
				mobile_network: formData.id,
				value: formData.amount,
				quantity: formData.quantity,
				pin: pin,
			});
			if (response.status === 200) {
				setEPinCards(response.data.data.data.TXN_EPIN);

				// Toast.show({
				// 	type: 'success',
				// 	text1: 'Success',
				// 	text2: 'EPin purchase successful',
				// });
				// router.back();
			}
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2:
					error.response?.data?.message ||
					error.response?.data ||
					error.message,
			});
			console.log(error.response?.data || error.message);
		} finally {
			if (pin) {
				setShowPin(false);
			}
			setLoading(false);
		}
	};

	const networkBadge = (network: string) => {
		const key = network.toLowerCase();
		const iconKey =
			key === '9mobile' ||
			key === 't2-mobile' ||
			key === 't2 mobile' ||
			key === 't2mobile'
				? 't2mobile'
				: key;
		const dataUri = NETWORK_ICON_DATA_URIS[iconKey];
		if (dataUri) {
			return `<img src="${dataUri}" alt="${network}" style="width:64px;height:64px;object-fit:contain;" />`;
		}
		return `<div style="width:64px;height:64px;border-radius:50%;background:#E5E7EB;color:#111;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;">${network}</div>`;
	};

	const buildVoucherHtml = (record: EPinHistoryRecord) => {
		const dial = getDialCode(record.network, record.pin_code);
		const price = Number(record.amount).toLocaleString();
		return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #111; }
.card { border: 1px solid #ddd; border-radius: 16px; padding: 24px; max-width: 420px; margin: 0 auto; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.title { font-size: 20px; font-weight: 700; margin: 0 0 12px; }
.row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ccc; }
.row:last-of-type { border-bottom: none; }
.label { color: #666; font-size: 13px; }
.value { font-weight: 600; font-size: 14px; }
.pin { font-size: 22px; font-weight: 800; letter-spacing: 2px; }
.footer { margin-top: 16px; font-size: 12px; color: #444; line-height: 1.5; }
.brand { font-size: 22px; font-weight: 800; color: #ccc; }
</style>
</head>
<body>
<div class="card">
<div class="header">
<div class="brand">Paxi</div>
${networkBadge(record.network)}
</div>
<h1 class="title">E-PIN Voucher — ${record.network}</h1>
<div class="row"><span class="label">Price</span><span class="value">&#8358;${price}</span></div>
<div class="row"><span class="label">PIN</span><span class="value pin">${record.pin_code}</span></div>
<div class="row"><span class="label">S/N</span><span class="value">${record.serial_number}</span></div>
<div class="row"><span class="label">Date</span><span class="value">${record.created_at.replace('T', ' ').slice(0, 19)}</span></div>
<div class="footer">
<strong>How to load:</strong> Dial ${dial}<br/>
Customer care: 08146382038. Powered by Paxi
</div>
</div>
</body>
</html>`;
	};

	const buildBatchVoucherHtml = (cards: EPinCard[]) => {
		const cardHtml = cards
			.map(card => {
				const dial = getDialCode(card.mobilenetwork, card.pin);
				const price = Number(card.amount).toLocaleString();
				return `<div class="card">
<div class="header">
<div class="brand">Paxi</div>
${networkBadge(card.mobilenetwork)}
</div>
<h1 class="title">E-PIN Voucher — ${card.mobilenetwork}</h1>
<div class="row"><span class="label">Price</span><span class="value">&#8358;${price}</span></div>
<div class="row"><span class="label">PIN</span><span class="value pin">${card.pin}</span></div>
<div class="row"><span class="label">S/N</span><span class="value">${card.sno}</span></div>
<div class="row"><span class="label">Batch</span><span class="value">${card.batchno}</span></div>
<div class="row"><span class="label">Date</span><span class="value">${card.transactiondate}</span></div>
<div class="footer">
<strong>How to load:</strong> Dial ${dial}<br/>
Customer care: 08146382038. Powered by Paxi
</div>
</div>`;
			})
			.join('<div style="height:16px;"></div>');
		return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #111; }
.card { border: 1px solid #ddd; border-radius: 16px; padding: 24px; max-width: 420px; margin: 0 auto; page-break-inside: avoid; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.title { font-size: 20px; font-weight: 700; margin: 0 0 12px; }
.row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ccc; }
.row:last-of-type { border-bottom: none; }
.label { color: #666; font-size: 13px; }
.value { font-weight: 600; font-size: 14px; }
.pin { font-size: 22px; font-weight: 800; letter-spacing: 2px; }
.footer { margin-top: 16px; font-size: 12px; color: #444; line-height: 1.5; }
.brand { font-size: 22px; font-weight: 800; color: #ccc; }
</style>
</head>
<body>${cardHtml}</body>
</html>`;
	};

	const handlePrintBatch = async (cards: EPinCard[]) => {
		if (cards.length === 0) return;
		try {
			await Print.printAsync({html: buildBatchVoucherHtml(cards)});
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Print failed',
				text2: error?.message || 'Could not open print dialog.',
			});
		}
	};

	const handlePrint = async (record: EPinHistoryRecord) => {
		try {
			await Print.printAsync({html: buildVoucherHtml(record)});
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Print failed',
				text2: error?.message || 'Could not open print dialog.',
			});
		}
	};

	const handleDownload = async (record: EPinHistoryRecord) => {
		try {
			const {uri} = await Print.printToFileAsync({
				html: buildVoucherHtml(record),
			});
			const canShare = await Sharing.isAvailableAsync();
			if (canShare) {
				await Sharing.shareAsync(uri, {
					mimeType: 'application/pdf',
					dialogTitle: 'Save E-PIN Voucher',
					UTI: 'com.adobe.pdf',
				});
			} else {
				Toast.show({
					type: 'success',
					text1: 'Saved',
					text2: uri,
				});
			}
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Download failed',
				text2: error?.message || 'Could not generate PDF.',
			});
		}
	};

	const handleCopy = (pin: string) => {
		Keyboard.dismiss();
		Clipboard.setStringAsync(pin);
		Toast.show({
			type: 'success',
			text1: 'Success',
			text2: 'EPin copied to clipboard',
		});
	};

	const {data: ePinData} = useQuery({
		queryKey: ['epin'],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.get<EPinDiscountsResponse>(
				'/v1/nellobytes/epin/discounts',
			);
			return response.data;
		},
	});

	return (
		<>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View className="px-[5%] pt-5 pb-10 gap-x-4 flex-1">
					<Back title="Printing" />
					<TouchableOpacity
						className="self-end mt-2"
						onPress={() => {
							setShowHistory(true);
							fetchHistory();
						}}
					>
						<Text className="text-[#1A73E8] text-sm font-medium">History</Text>
					</TouchableOpacity>
					<View className="flex-1">
						<View className="my-10">
							<Text className="text-3xl font-semibold">
								Print recharge card
							</Text>
							{/* <Text className="text-secondary mt-2 rounded-tl-2xl"></Text> */}
						</View>

						<View className="gap-y-5">
							<View>
								<View className="gap-y-5">
									<Text className="text-xl font-bold">Network</Text>
									<TouchableOpacity
										onPress={() => setShowNetworkModal(true)}
										className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center overflow-hidden"
									>
										{formData.network ? (
											<View className="flex-row items-center gap-x-5">
												{networkProvidersIcon(formData.network.toLowerCase())}

												<Text className="text-lg">{formData.network}</Text>
											</View>
										) : (
											<Text className="text-lg">Select Network</Text>
										)}

										<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
									</TouchableOpacity>
								</View>
								{showNetworkModal && (
									<Modal transparent>
										<Pressable
											style={globalStyles.overlay}
											onPress={() => setShowNetworkModal(false)}
										/>
										<View className="flex-1 justify-end items-end">
											<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
												<Text className="text-2xl font-bold">
													Select Network
												</Text>
												<View className="my-5">
													{ePinData?.data?.discounts.map(network => (
														<TouchableOpacity
															key={network.network.replace(
																'9Mobile',
																'T2mobile',
															)}
															className="py-5 flex-row items-center gap-x-5"
															onPress={() => {
																setFormData(prev => ({
																	...prev,
																	network: network.network.replace(
																		'9Mobile',
																		'T2mobile',
																	),
																	id: network.network_id,
																}));
																setShowNetworkModal(false);
															}}
														>
															{networkProvidersIcon(
																network.network
																	.replace('9Mobile', 'T2mobile')
																	.toLowerCase(),
															)}

															<Text className="text-2xl">
																{network.network.replace('9Mobile', 'T2mobile')}
															</Text>
														</TouchableOpacity>
													))}
												</View>
											</View>
										</View>
									</Modal>
								)}
							</View>

							<View className="gap-y-5">
								<Text className="text-xl font-bold">Quantity</Text>

								<TextInput
									className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
									inputMode="tel"
									maxLength={11}
									value={formData.quantity.replace(/[<>"'&/]/g, '')}
									onChangeText={text =>
										setFormData(prev => ({
											...prev,
											quantity: text.replace(/[<>"'&/]/g, ''),
										}))
									}
									placeholder="Quantity"
									placeholderTextColor={'#7D7D7D'}
								/>
							</View>
							<View className="gap-y-5">
								<Text className="text-xl font-bold">Amount</Text>
								<TouchableOpacity
									onPress={() => setShowAmountModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center overflow-hidden"
									disabled={!formData.network}
								>
									{formData.amount ? (
										<View className="flex-row items-center gap-x-5">
											<Text className="text-lg">{formData.amount}</Text>
										</View>
									) : (
										<Text className="text-lg">Select Amount</Text>
									)}

									<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
								</TouchableOpacity>
								{showAmountModal && (
									<Modal transparent>
										<Pressable
											style={globalStyles.overlay}
											onPress={() => setShowAmountModal(false)}
										/>
										<View className="flex-1 justify-end items-end">
											<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
												<Text className="text-2xl font-bold">
													Select Amount
												</Text>
												<View className="my-5">
													{ePinData?.data?.discounts
														.find(
															network =>
																network.network.replace(
																	'9Mobile',
																	'T2mobile',
																) === formData.network,
														)
														?.prices.map(price => (
															<TouchableOpacity
																key={price.amount}
																className="py-5 flex-row items-center gap-x-5"
																onPress={() => {
																	setFormData(prev => ({
																		...prev,
																		amount: price.amount,
																	}));
																	setShowAmountModal(false);
																}}
															>
																<Text className="text-2xl">{price.amount}</Text>
															</TouchableOpacity>
														))}
												</View>
											</View>
										</View>
									</Modal>
								)}

								{formData.amount > 0 &&
									formData.network &&
									formData.quantity && (
										<View className="bg-[#e9f1fe] p-3">
											<View className="flex-row items-center justify-between">
												<Text className="text-lg text-[#4E4E4E]">Network</Text>
												<View className="flex-row items-center justify-between gap-2">
													{networkProvidersIcon(formData.network.toLowerCase())}
													<Text className="font-semibold">
														{formData.network}
													</Text>
												</View>
											</View>
											<View className="flex-row items-center justify-between mt-2">
												<Text className="text-lg text-[#4E4E4E]">Quantity</Text>
												<Text className="font-semibold">
													{formData.quantity}
												</Text>
											</View>

											<View className="flex-row items-center justify-between mt-3">
												<Text className="text-lg text-[#4E4E4E]">
													Amount per epin
												</Text>
												<Text className="font-semibold">
													₦{formData.amount}
												</Text>
											</View>
											<View className="flex-row items-center justify-between mt-3">
												<Text className="text-lg text-[#4E4E4E]">
													Payable per epin
												</Text>
												<Text className="font-semibold">
													₦
													{ePinData?.data?.discounts
														.find(
															network =>
																network.network.replace(
																	'9Mobile',
																	'T2mobile',
																) === formData.network,
														)
														?.prices.find(
															price => price.amount === formData.amount,
														)?.payable || 0}
												</Text>
											</View>
											<View className="flex-row items-center justify-between mt-3">
												<Text className="text-lg font-semibold text-[#4E4E4E]">
													Total Discounts
												</Text>
												<Text className="text-green-500 font-semibold">
													-₦
													{(
														formData.amount * Number(formData.quantity) -
														(ePinData?.data?.discounts
															.find(
																network =>
																	network.network.replace(
																		'9Mobile',
																		'T2mobile',
																	) === formData.network,
															)
															?.prices.find(
																price => price.amount === formData.amount,
															)?.payable || 0) *
															Number(formData.quantity)
													).toLocaleString()}
												</Text>
											</View>
											<View className="flex-row items-center justify-between mt-5 border-t border-black py-2">
												<Text className="text-xl font-bold flex-1">
													Total Payable
												</Text>
												<Text className="text-xl font-semibold">
													₦
													{(
														(ePinData?.data?.discounts
															.find(
																network =>
																	network.network.replace(
																		'9Mobile',
																		'T2mobile',
																	) === formData.network,
															)
															?.prices.find(
																price => price.amount === formData.amount,
															)?.payable || 0) * Number(formData.quantity)
													).toLocaleString()}
												</Text>
											</View>
										</View>
									)}
							</View>
						</View>
					</View>
					<Button
						title={`Pay ${
							formData.amount && formData.quantity
								? `₦${(
										(ePinData?.data?.discounts
											.find(
												network =>
													network.network.replace('9Mobile', 'T2mobile') ===
													formData.network,
											)
											?.prices.find(price => price.amount === formData.amount)
											?.payable || 0) * Number(formData.quantity)
									).toLocaleString()}`
								: ''
						}`}
						onPress={() => handleBuy()}
					/>
					{showPin && (
						<PinModal
							showPin={showPin}
							setShowPin={setShowPin}
							handleContinue={handleBuy}
						/>
					)}
				</View>
			</TouchableWithoutFeedback>
			<Modal
				transparent
				visible={ePinCards.length > 0}
				animationType="fade"
				onRequestClose={router.back}
			>
				<Pressable
					style={globalStyles.overlay}
					onPress={() => setEPinCards([])}
				/>
				<View className="flex-1 justify-center items-center">
					<View
						className="bg-white w-[80%] max-h-[70%] overflow-hidden py-8 px-5 rounded-2xl items-center "
						// style={{maxHeight: '70%'}}
					>
						<View className="bg-green-500 rounded-full p-2 mb-4">
							<Entypo name="check" size={24} color="white" />
						</View>
						<Text className="text-xl font-bold mb-2">
							Epin purchase successful
						</Text>
						<Text className="text-gray-600 text-center">
							Your epin has been purchased successfully.
						</Text>
						<ScrollView className="w-full">
							{ePinCards.map((card, index) => (
								<View
									className="w-full p-3 bg-[#F3F4F6] rounded-lg mt-6 flex-row items-center"
									key={card.transactionid}
								>
									<Text className="font-bold text-2xl mt-3 flex-1 text-center">
										{card.pin}
									</Text>
									<TouchableOpacity
										onPress={() => handleCopy(card.pin)}
										className="bg-primary p-3 rounded-lg"
									>
										<FontAwesome5 name="copy" size={24} color="white" />
									</TouchableOpacity>
								</View>
							))}
						</ScrollView>

						<View className="flex-row w-full gap-5 mt-10">
							<TouchableOpacity
								onPress={() => handlePrintBatch(ePinCards)}
								className="bg-primary flex-1 rounded-lg overflow-hidden p-4 flex-row items-center justify-center gap-x-2"
							>
								<FontAwesome5 name="print" size={18} color="white" />
								<Text className=" text-white text-center text-xl font-bold">
									Print
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={router.back}
								className="bg-primary flex-1 rounded-lg overflow-hidden p-4"
							>
								<Text className=" text-white text-center text-xl font-bold">
									Done
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				<Toast />
			</Modal>

			{/* History Modal */}
			{showHistory && (
				<Modal
					transparent
					animationType="slide"
					onRequestClose={() => setShowHistory(false)}
				>
					<Pressable
						className="flex-1 bg-black/40"
						onPress={() => setShowHistory(false)}
					/>
					<View
						className="bg-[#F5F5F5] w-full rounded-t-2xl"
						style={{maxHeight: '80%'}}
					>
						<View className="px-[5%] pt-6 pb-4 bg-white rounded-t-2xl flex-row justify-between items-center">
							<Text className="text-2xl font-bold">Purchase History</Text>
							<TouchableOpacity onPress={() => setShowHistory(false)}>
								<Text className="text-[#666] text-base">✕</Text>
							</TouchableOpacity>
						</View>
						{historyLoading ? (
							<View className="py-16 items-center">
								<Text className="text-[#666] text-base">Loading...</Text>
							</View>
						) : history.length === 0 ? (
							<View className="py-16 items-center">
								<Text className="text-[#666] text-base">No history found</Text>
							</View>
						) : (
							<ScrollView
								className="px-[5%] py-4"
								showsVerticalScrollIndicator={false}
							>
								{history.map(record => (
									<TouchableOpacity
										key={record.id}
										className="bg-white rounded-xl px-4 py-4 mb-3"
										onPress={() => setSelectedRecord(record)}
									>
										<View className="flex-row justify-between items-center mb-2">
											<View className="flex-row items-center gap-x-2">
												{networkProvidersIcon(record.network.toLowerCase())}
												<Text className="font-bold text-base text-[#111]">
													{record.network}
												</Text>
											</View>
											<View>
												<Text
													className={`text-xs font-semibold ${record.status === 'unused' ? 'text-green-700' : 'text-gray-500'}`}
												>
													#{record.transaction_id}
												</Text>
											</View>
										</View>
										<Text className="font-semibold text-secondary text-sm mb-2">
											₦{Number(record.amount).toLocaleString()}
										</Text>
										<View className="flex-row items-center justify-between bg-[#F5F6FA] rounded-lg px-3 py-2 mb-1">
											<Text
												className="text-[#1A73E8] text-sm font-medium flex-1"
												numberOfLines={1}
											>
												{record.pin_code}
											</Text>
											<TouchableOpacity
												onPress={() => handleCopy(record.pin_code)}
												className="ml-2"
											>
												<FontAwesome5 name="copy" size={14} color="#1A73E8" />
											</TouchableOpacity>
										</View>
										<Text className="text-[#999] text-xs mt-1">
											{record.created_at.replace('T', ' ').slice(0, 19)}
										</Text>
									</TouchableOpacity>
								))}
								<View className="w-full h-32" />
							</ScrollView>
						)}
					</View>
				</Modal>
			)}

			{/* Voucher Detail Modal */}
			{selectedRecord && (
				<Modal transparent animationType="fade">
					<Pressable
						className="flex-1 bg-black/50"
						onPress={() => setSelectedRecord(null)}
					/>
					<View className="absolute self-center w-[88%]" style={{top: '15%'}}>
						<View className="bg-white rounded-2xl overflow-hidden">
							{/* Header */}
							<View className="flex-row justify-between items-center px-5 pt-5 pb-3">
								<Text className="text-lg font-bold text-[#111]">
									E-PIN Voucher
								</Text>
								<TouchableOpacity onPress={() => setSelectedRecord(null)}>
									<Text className="text-[#999] text-xl">✕</Text>
								</TouchableOpacity>
							</View>
							{/* Logos row */}
							<View className="flex-row justify-between items-center px-5 pb-4">
								<Text className="text-2xl font-bold text-[#ccc]">Paxi</Text>
								<View style={{transform: [{scale: 1.5}]}}>
									{networkProvidersIcon(selectedRecord.network.toLowerCase())}
								</View>
							</View>
							{/* Dashed separator */}
							<View
								style={{
									borderTopWidth: 1,
									borderStyle: 'dashed',
									borderColor: '#bbb',
									marginHorizontal: 20,
								}}
							/>
							{/* Details */}
							<View className="px-5 py-4 gap-y-3">
								<View className="flex-row justify-between items-center">
									<Text className="text-[#666] text-sm">Price</Text>
									<Text className="font-semibold text-[#111] text-sm">
										₦{Number(selectedRecord.amount).toLocaleString()}
									</Text>
								</View>
								<View className="flex-row justify-between items-center">
									<Text className="text-[#666] text-sm">PIN</Text>
									<Text className="font-bold text-[#111] text-base tracking-wider">
										{selectedRecord.pin_code}
									</Text>
								</View>
								<View className="flex-row justify-between items-center">
									<Text className="text-[#666] text-sm">S/N</Text>
									<Text className="text-[#444] text-sm">
										{selectedRecord.serial_number}
									</Text>
								</View>
							</View>
							{/* Dashed separator */}
							<View
								style={{
									borderTopWidth: 1,
									borderStyle: 'dashed',
									borderColor: '#bbb',
									marginHorizontal: 20,
								}}
							/>
							{/* Footer info */}
							<View className="px-5 py-4">
								<Text className="text-[#444] text-xs leading-5">
									<Text className="font-bold">How to load: </Text>
									Dial{' '}
									{getDialCode(selectedRecord.network, selectedRecord.pin_code)}
								</Text>
								<Text className="text-[#444] text-xs mt-1">
									Customer care: 08146382038. Powered by Paxi
								</Text>
							</View>
							{/* Print + Download buttons */}
							<View className="flex-row mx-5 mb-5 gap-x-3">
								<TouchableOpacity
									className="flex-1 bg-[#111] rounded-xl py-4 flex-row items-center justify-center gap-x-2"
									onPress={() => handlePrint(selectedRecord)}
								>
									<FontAwesome5 name="print" size={16} color="white" />
									<Text className="text-white font-bold text-base">Print</Text>
								</TouchableOpacity>
								<TouchableOpacity
									className="flex-1 bg-secondary rounded-xl py-4 flex-row items-center justify-center gap-x-2"
									onPress={() => handleDownload(selectedRecord)}
								>
									<FontAwesome5 name="download" size={16} color="white" />
									<Text className="text-white font-bold text-base">
										Download
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>
			)}
		</>
	);
};

export default Printing;
