import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type LoadingProps = {
	size?: 'small' | 'large';
	color?: string;
};

function Loading({ size = 'large', color = '#999' }: LoadingProps) {
	return (
		<View style={styles.container}>
			<ActivityIndicator size={size} color={color} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default Loading;
