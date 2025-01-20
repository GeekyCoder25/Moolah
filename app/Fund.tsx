import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';

const Fund = () => {
	const [activeTab, setActiveTab] = useState('card');
	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Fund Wallet" />

			<View className="flex-row justify-between items-center pt-10 border-b-[#EBEBEB] border-b-[1px]">
				<TouchableOpacity
					onPress={() => setActiveTab('bank')}
					className={
						activeTab === 'bank' ? 'border-b-[1px] border-b-secondary' : ''
					}
				>
					<Text
						className={`${
							activeTab === 'bank'
								? 'text-secondary border-b-[1px] border-b-secondary'
								: 'text-[#7D7D7D]'
						} text-2xl`}
					>
						Bank
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveTab('card')}
					className={
						activeTab === 'card' ? 'border-b-[1px] border-b-secondary' : ''
					}
				>
					<Text
						className={`${
							activeTab === 'card'
								? 'text-secondary border-b-[1px] border-b-secondary'
								: 'text-[#7D7D7D]'
						} text-2xl`}
					>
						Card
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveTab('manual')}
					className={
						activeTab === 'manual' ? 'border-b-[1px] border-b-secondary' : ''
					}
				>
					<Text
						className={`${
							activeTab === 'manual'
								? 'text-secondary border-b-[1px] border-b-secondary'
								: 'text-[#7D7D7D]'
						} text-2xl`}
					>
						Manual
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default Fund;
