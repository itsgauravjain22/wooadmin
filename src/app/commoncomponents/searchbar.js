import React, { Component } from 'react';
import { View, TextInput, Text, TouchableOpacity, Modal, StyleSheet, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { ScreenOrientation } from 'expo';

const config = require('../../../config.json');

export default class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            scanned: false,
            barcodeScannerShown: false,
            searchValue: ''
        };
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getPermissionsAsync = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync()
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    displayBarcode = () => {
        if (this.state.barcodeScannerShown) {
            this.getPermissionsAsync();
            if (this.state.hasCameraPermission === true) {
                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
                return (
                    <Modal>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                            }}>
                            <BarCodeScanner
                                onBarCodeScanned={this.handleBarcodeOutput}
                                style={[StyleSheet.absoluteFillObject, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
                            >
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{
                                        fontSize: 25,
                                        fontWeight: 'bold',
                                        margin: 10,
                                        color: 'white',
                                    }}
                                    >Scan Barcode</Text>
                                    <View
                                        style={{
                                            width: 300,
                                            height: 300,
                                            backgroundColor: 'transparent',
                                            borderColor: 'white',
                                            borderWidth: 1,
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                barcodeScannerShown: false
                                            })
                                            ScreenOrientation.unlockAsync()
                                        }}
                                    >
                                        <Ionicons name='md-close-circle-outline' height size={60} color={config.colors.iconLightColor} />
                                    </TouchableOpacity>
                                </View>
                            </BarCodeScanner>
                        </View>
                    </Modal>
                )
            }
            else if (this.state.hasCameraPermission === false) {
                ToastAndroid.show('Camera permission not granted', ToastAndroid.LONG)
                this.setState({ barcodeScannerShown: false })
            } else {
                return null
            }
        } else {
            return null
        }
    }

    handleSearchPress = () => {
        this._isMounted && this.props.onSearchPress(this.state.searchValue)
    }

    handleBarcodeOutput = ({ type, data }) => {
        this.setState({
            searchValue: data,
            scanned: true,
            barcodeScannerShown: false
        }, () => {
            ScreenOrientation.unlockAsync()
            this._isMounted && this.props.onSearchPress(this.state.searchValue)
        })
    }

    render() {
        return (
            <View style={{ height: 40, backgroundColor: 'white' }}>
                {this.displayBarcode()}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            style={{
                                height: '100%',
                                borderBottomWidth: 1,
                                borderColor: 'gray',
                                paddingLeft: 10
                            }}
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
                        <TouchableOpacity style={{
                            height: '100%',
                            backgroundColor: config.colors.btnColor,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                            onPress={() => this.setState({ barcodeScannerShown: true })}>
                            <Ionicons name='md-barcode' height size={32} color={config.colors.iconLightColor} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    };
}