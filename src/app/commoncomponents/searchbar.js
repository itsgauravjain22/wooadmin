import React, { Component } from 'react';
import { View, TextInput, Text, TouchableOpacity, Modal, StyleSheet, ToastAndroid, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            scanned: false,
            barcodeScannerShown: false,
            searchValue: ''
        };
    }

    getPermissionsAsync = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    displayBarcode = () => {
        const { width, height } = Dimensions.get('window')
        this.getPermissionsAsync();
        if (this.state.hasCameraPermission === false) {
            ToastAndroid.show('Camera Permission Not Granted', ToastAndroid.LONG)
        } else if (this.state.hasCameraPermission === true) {
            if (this.state.barcodeScannerShown) {
                return (<Modal>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                        }}>
                        <BarCodeScanner
                            onBarCodeScanned={this.handleBarcodeOutput}
                            style={StyleSheet.absoluteFillObject, { flex: 1, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{
                                fontSize: 25,
                                fontWeight: 'bold',
                                margin: 10,
                                textAlign: 'center',
                                width: '70%',
                                color: 'white',
                            }}
                            >Scan Barcode</Text>
                            <View
                                style={{
                                    width: width < height ? 0.8 * width : 0.8 * height,
                                    height: width < height ? 0.8 * width : 0.8 * height,
                                    backgroundColor: 'transparent',
                                    borderColor: 'white',
                                    borderWidth: 1,
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => this.setState({ barcodeScannerShown: false })}
                            >
                                <Ionicons name='md-close-circle-outline' height size={60} color='white' />
                            </TouchableOpacity>
                        </BarCodeScanner>
                    </View>
                </Modal>)
            } else {
                return <></>
            }
        }
    }

    handleSearchPress = () => {
        this.props.onSearchPress(this.state.searchValue)
    }

    handleBarcodeOutput = ({ type, data }) => {
        this.setState({
            searchValue: data,
            scanned: true,
            barcodeScannerShown: false
        }, () => {
            this.props.onSearchPress(this.state.searchValue)
        })
    }

    render() {
        return (
            <View style={{ height: 50, backgroundColor: 'white' }}>
                {this.displayBarcode()}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            style={{ height: '100%', borderBottomWidth: 1, borderColor: 'gray' }}
                            placeholder={'Search'}
                            value={this.state.searchValue}
                            returnKeyType={'search'}
                            onChangeText={(value) => this.setState({
                                searchValue: value
                            })}
                            onSubmitEditing={this.handleSearchPress}
                        />
                    </View>
                    <View style={{ width: 50 }}>
                        <TouchableOpacity style={{ height: '100%', backgroundColor: '#96588a', justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => this.setState({ barcodeScannerShown: true })}>
                            <Ionicons name='md-barcode' height size={32} color='white' />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    };
}