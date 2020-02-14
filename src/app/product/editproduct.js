import React, { Component } from 'react';
import {
    StyleSheet, Text, View, Switch, KeyboardAvoidingView, TouchableOpacity,
    ScrollView, ActivityIndicator, TextInput, Picker, ToastAndroid
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MultiSelect from 'react-native-multiple-select';
import FloatingLabel from 'react-native-floating-labels'
import * as SecureStore from 'expo-secure-store';
import GLOBAL from './productglobal'

const config = require('../../../config.json');

export default class EditProduct extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Edit Product',
        };
    };

    constructor(props) {
        super(props);
        productId = this.props.navigation.getParam('productId');
        this.state = {
            loading: true,
            error: null,
            base_url: null,
            c_key: null,
            c_secret: null,
            productCategoriesPage: 1,
            hasMoreProductCategoriesToLoad: true,
            productCategories: [],
            selectedProductCategories: [],
            name: null,
            sku: null,
            status: null,
            regularPrice: null,
            salePrice: null,
            dateOnSaleFrom: "",
            showDateOnSaleFrom: false,
            dateOnSaleTo: "",
            showDateOnSaleTo: false,
            manageStock: null,
            stockStatus: null,
            stockQuantity: null,
            weight: null,
            length: null,
            width: null,
            height: null,
            type: null,
            virtual: null,
            downloadable: null,
        }
        this._isMounted = false
    }

    async componentDidMount() {
        this._isMounted = true;
        this._isMounted && await this.getCredentials();
        this._isMounted && this.fetchAllProductCategories()
    }

    getCredentials = async () => {
        const credentials = await SecureStore.getItemAsync('credentials');
        const credentialsJson = JSON.parse(credentials)
        this.setState({
            base_url: credentialsJson.base_url,
            c_key: credentialsJson.c_key,
            c_secret: credentialsJson.c_secret,
        })
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                    <ActivityIndicator color={config.colors.loadingColor} size='large' />
                </View>
            )
        }

        return (
            <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior='padding' enabled>
                <ScrollView contentContainerStyle={{ paddingBottom: 50 }} >
                    {this.displayProductBasicDetailsSection()}
                    {this.displayProductStatusSection()}
                    {this.displayProductCategoriesSection()}
                    {this.displayProductPricingSection()}
                    {this.displayProductInventorySection()}
                    {this.displayProductShippingSection()}
                    {/* {this.displayProductTypeSection()} */}
                </ScrollView>
                {this.displaySubmitButton()}
            </KeyboardAvoidingView>
        );
    }

    //Fetch Functions Below

    fetchAllProductCategories = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/products/categories?per_page=20&page=${this.state.productCategoriesPage}&consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                if (Array.isArray(responseJson) && responseJson.length > 0 && 'id' in responseJson[0]) {
                    responseJson.forEach((item, index) => {
                        responseJson[index].id = item.id.toString()
                    })
                    this.setState({
                        hasMoreProductCategoriesToLoad: true,
                        productCategoriesPage: this.state.productCategoriesPage + 1,
                        productCategories: this.state.productCategories.concat(responseJson),
                    }, this.fetchAllProductCategories);
                } else if (Array.isArray(responseJson) && responseJson.length === 0) {
                    this.setState({
                        hasMoreProductCategoriesToLoad: false,
                    }, this.fetchProductDetails)
                } else if ('code' in responseJson) {
                    this.setState({
                        error: responseJson.code,
                        loading: false
                    })
                }
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false
                })
            });
    }

    fetchProductDetails = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/products/${productId}?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                if (!'code' in responseJson) {
                    this.setState({
                        productData: responseJson
                    })
                }
                if ('name' in responseJson) {
                    this.setState({
                        name: responseJson.name
                    })
                }
                if ('sku' in responseJson) {
                    this.setState({
                        sku: responseJson.sku
                    })
                }
                if ('status' in responseJson) {
                    this.setState({
                        status: responseJson.status
                    })
                }
                if ('regular_price' in responseJson) {
                    this.setState({
                        regularPrice: responseJson.regular_price
                    })
                }
                if ('sale_price' in responseJson) {
                    this.setState({
                        salePrice: responseJson.sale_price
                    })
                }
                if ('date_on_sale_from' in responseJson) {
                    this.setState({
                        dateOnSaleFrom: responseJson.date_on_sale_from ? responseJson.date_on_sale_from : ''
                    })
                }
                if ('date_on_sale_to' in responseJson) {
                    this.setState({
                        dateOnSaleTo: responseJson.date_on_sale_to ? responseJson.date_on_sale_to : ''
                    })
                }
                if ('manage_stock' in responseJson) {
                    this.setState({
                        manageStock: responseJson.manage_stock
                    })
                }
                if ('stock_status' in responseJson) {
                    this.setState({
                        stockStatus: responseJson.stock_status
                    })
                }
                if ('stock_quantity' in responseJson) {
                    this.setState({
                        stockQuantity: responseJson.stock_quantity
                    })
                }
                if ('weight' in responseJson) {
                    this.setState({
                        weight: responseJson.weight
                    })
                }
                if ("dimensions" in responseJson) {
                    if ('length' in responseJson.dimensions) {
                        this.setState({
                            length: responseJson.dimensions.length
                        })
                    }
                    if ('width' in responseJson.dimensions) {
                        this.setState({
                            width: responseJson.dimensions.width
                        })
                    }
                    if ('height' in responseJson.dimensions) {
                        this.setState({
                            height: responseJson.dimensions.height
                        })
                    }
                }
                if ('type' in responseJson) {
                    this.setState({
                        type: responseJson.type
                    })
                }
                if ('virtual' in responseJson) {
                    this.setState({
                        virtual: responseJson.virtual
                    })
                }
                if ('downloadable' in responseJson) {
                    this.setState({
                        downloadable: responseJson.downloadable
                    })
                }
                if ('categories' in responseJson && Array.isArray(responseJson.categories) && responseJson.categories.length) {
                    let selectedProductCategories = []
                    responseJson.categories.forEach(item => {
                        if (item.id) {
                            selectedProductCategories.push(item.id.toString())
                        }
                    })
                    this.setState({
                        selectedProductCategories: selectedProductCategories
                    })
                }
                this.setState({
                    error: responseJson.code || null,
                    loading: false,
                })
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false
                })
            });
    }

    //Display Functions Below

    displayProductBasicDetailsSection = () => {
        return (
            < View style={styles.section} >
                <Text style={styles.titleText}>Basic Details</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <FloatingLabel
                            inputStyle={styles.floatingInput}
                            style={styles.formInput}
                            value={this.state.name ? this.state.name.toString() : ''}
                            onChangeText={(value) => {
                                this.setState({ name: value })
                            }}
                        >Name</FloatingLabel>
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <FloatingLabel
                            inputStyle={styles.floatingInput}
                            style={styles.formInput}
                            value={this.state.sku ? this.state.sku.toString() : ''}
                            onChangeText={(value) => {
                                this.setState({ sku: value })
                            }}
                        >SKU</FloatingLabel>
                    </View>
                </View>
            </View >
        )
    }

    displayProductStatusSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Status</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <Text>Status: </Text>
                    </View>
                    <View style={styles.sectionCol}>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.status}
                            onValueChange={text => {
                                this.setState({
                                    status: text.toString()
                                })
                            }}
                        >
                            <Picker.Item label="Draft" value="draft" />
                            <Picker.Item label="Publish" value="publish" />
                            <Picker.Item label="Pending" value="pending" />
                            <Picker.Item label="Private" value="private" />
                        </Picker>
                    </View>
                </View>
            </View>
        )
    }

    displayProductCategoriesSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Categories</Text>
                <View style={{ marginLeft: 10, marginRight: 10 }}>
                    <MultiSelect
                        items={this.state.productCategories}
                        uniqueKey="id"
                        displayKey="name"
                        onSelectedItemsChange={selectedItems => this.setState({
                            selectedProductCategories: selectedItems
                        })}
                        fixedHeight={false}
                        hideTags
                        ref={(component) => { this.multiSelect = component }}
                        selectedItems={this.state.selectedProductCategories}
                        selectText="Pick Categories"
                        searchInputPlaceholderText="Search Category..."
                        searchInputStyle={{ height: 40, color: 'black' }}
                        itemTextColor='black'
                        selectedItemTextColor={config.colors.multiSelectSelectedColor}
                        selectedItemIconColor={config.colors.multiSelectSelectedColor}
                        submitButtonColor={config.colors.btnColor}
                        submitButtonText='Update Categories'
                    />
                </View>
            </View>
        )
    }

    displayProductPricingSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Pricing</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <FloatingLabel
                            labelStyle={styles.labelInput}
                            inputStyle={styles.floatingInput}
                            style={styles.formInput}
                            keyboardType='numeric'
                            value={this.state.regularPrice ? this.state.regularPrice.toString() : ''}
                            onChangeText={(value) => {
                                if (!isNaN(parseInt(value))) {
                                    this.setState({ regularPrice: value });
                                } else {
                                    this.setState({ regularPrice: null });
                                }
                            }}
                        >Regular Price</FloatingLabel>
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <FloatingLabel
                            labelStyle={styles.labelInput}
                            inputStyle={styles.floatingInput}
                            style={styles.formInput}
                            keyboardType='numeric'
                            value={this.state.salePrice ? this.state.salePrice.toString() : ''}
                            onChangeText={(value) => {
                                if (!isNaN(parseInt(value))) {
                                    this.setState({ salePrice: value });
                                } else{
                                    this.setState({ salePrice: null });
                                }
                            }}
                        >Sale Price</FloatingLabel>
                    </View>
                </View>
                <View style={[styles.sectionRow, { marginTop: 15 }]}>
                    <View style={[styles.sectionCol, { alignItems: 'center' }]}>
                        <Text>Sale Date From: </Text>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                this.setState({
                                    showDateOnSaleFrom: true
                                })
                            }}>
                            <Text>{this.state.dateOnSaleFrom ? new Date(this.state.dateOnSaleFrom).toDateString() : 'Select Date'}</Text>
                        </TouchableOpacity>
                        {this.state.showDateOnSaleFrom && <DateTimePicker
                            value={this.state.dateOnSaleFrom ? new Date(this.state.dateOnSaleFrom) : new Date()}
                            mode='date'
                            onChange={(event, date) => {
                                date = date ? date.toISOString() : "";
                                this.setState({
                                    showDateOnSaleFrom: false,
                                    dateOnSaleFrom: date,
                                })
                            }}
                        />}
                    </View>
                    <View style={[styles.sectionCol, { alignItems: 'center' }]}>
                        <Text>Sale Date To: </Text>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                this.setState({
                                    showDateOnSaleTo: true
                                })
                            }}>
                            <Text>{this.state.dateOnSaleTo ? new Date(this.state.dateOnSaleTo).toDateString() : 'Select Date'}</Text>
                        </TouchableOpacity>
                        {this.state.showDateOnSaleTo && <DateTimePicker
                            value={this.state.dateOnSaleTo ? new Date(this.state.dateOnSaleTo) : new Date()}
                            mode='date'
                            onChange={(event, date) => {
                                date = date ? date.toISOString() : "";
                                this.setState({
                                    showDateOnSaleTo: false,
                                    dateOnSaleTo: date,
                                })
                            }}
                        />}
                    </View>
                </View>
            </View>
        )
    }

    displayProductInventorySection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Inventory</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <Text>Stock Status: </Text>
                    </View>
                    <View style={styles.sectionCol}>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.stock_status}
                            onValueChange={(value) => {
                                this.setState({ stockStatus: value.toString() })
                            }}
                        >
                            <Picker.Item label="In Stock" value="instock" />
                            <Picker.Item label="Out of Stock" value="outofstock" />
                            <Picker.Item label="On Backorder" value="onbackorder" />
                        </Picker>
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <Text>Manage Stock: </Text>
                    </View>
                    <View style={[styles.sectionCol, { alignItems: 'center' }]}>
                        <Switch
                            thumbColor={config.colors.switchThumbColor}
                            trackColor={{ true: config.colors.switchTrackColor }}
                            value={this.state.manageStock}
                            onValueChange={(value) => {
                                this.setState({ manageStock: value })
                            }}
                        />
                    </View>
                </View>
                {this.state.manageStock
                    ? <View style={styles.sectionRow}>
                        <View style={styles.sectionCol}>
                            <FloatingLabel
                                labelStyle={styles.labelInput}
                                inputStyle={styles.floatingInput}
                                style={styles.formInput}
                                keyboardType='numeric'
                                value={this.state.stockQuantity ? this.state.stockQuantity.toString() : null}
                                onChangeText={(value) => {
                                    if (!isNaN(parseInt(value))) {
                                        this.setState({ stockQuantity: parseInt(value) })
                                    } else {
                                        this.setState({ stockQuantity: null })
                                    }
                                }}
                            >Stock Quantity</FloatingLabel>
                        </View>
                    </View>
                    : null}
            </View>
        )
    }

    displayProductShippingSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Shipping</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <FloatingLabel
                            labelStyle={styles.labelInput}
                            inputStyle={styles.floatingInput}
                            style={styles.formInput}
                            keyboardType='numeric'
                            value={this.state.weight}
                            onChangeText={(value) => {
                                if (!isNaN(parseInt(value))) {
                                    this.setState({ weight: value })
                                } else {
                                    this.setState({ weight: null })
                                }
                            }}
                        >Weight</FloatingLabel>
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <FloatingLabel
                            labelStyle={styles.labelInput}
                            inputStyle={styles.floatingInput}
                            style={styles.formInput}
                            keyboardType='numeric'
                            value={this.state.length}
                            onChangeText={(value) => {
                                if (!isNaN(parseInt(value))) {
                                    this.setState({ length: value })
                                } else {
                                    this.setState({ length: null })
                                }
                            }}
                        >L</FloatingLabel>
                    </View>
                    <View style={styles.sectionCol}>
                        <FloatingLabel
                            labelStyle={styles.labelInput}
                            inputStyle={styles.floatingInput}
                            style={styles.formInput}
                            keyboardType='numeric'
                            value={this.state.width}
                            onChangeText={(value) => {
                                if (!isNaN(parseInt(value))) {
                                    this.setState({ width: value })
                                } else {
                                    this.setState({ width: null })
                                }
                            }}
                        >W</FloatingLabel>
                    </View>
                    <View style={styles.sectionCol}>
                        <FloatingLabel
                            labelStyle={styles.labelInput}
                            inputStyle={styles.floatingInput}
                            style={styles.formInput}
                            keyboardType='numeric'
                            value={this.state.height}
                            onChangeText={(value) => {
                                if (!isNaN(parseInt(value))) {
                                    this.setState({ height: value })
                                } else {
                                    this.setState({ height: null })
                                }
                            }}
                        >H</FloatingLabel>
                    </View>
                </View>
            </View>
        )
    }

    displayProductTypeSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Type</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <Text>Product Type: </Text>
                    </View>
                    <View style={styles.sectionCol}>
                        <Picker mode='dropdown'
                            selectedValue={this.state.type}
                            onValueChange={(value) => {
                                this.setState({ type: value.toString() })
                            }}
                        >
                            <Picker.Item label="Simple" value="simple" />
                        </Picker>
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <Text>Virtual: </Text>
                    </View>
                    <View style={styles.sectionCol}>
                        <Switch
                            thumbColor={config.colors.switchThumbColor}
                            trackColor={{ true: config.colors.switchTrackColor }}
                            value={this.state.virtual}
                            onValueChange={(value) => {
                                this.setState({ virtual: value })
                            }}
                        />
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                        <Text>Downloadable: </Text>
                    </View>
                    <View style={styles.sectionCol}>
                        <Switch
                            thumbColor={config.colors.switchThumbColor}
                            trackColor={{ true: config.switchTrackColor }}
                            value={this.state.downloadable}
                            onValueChange={(value) => {
                                this.setState({ downloadable: value })
                            }}
                        />
                    </View>
                </View>
            </View>
        )
    }

    displaySubmitButton = () => {
        return (
            <TouchableOpacity
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 50,
                    backgroundColor: config.colors.btnColor
                }}
                onPress={this.handleSubmit}
            >
                <Text style={{ color: config.colors.btnTextColor }}>Submit</Text>
            </TouchableOpacity>
        )
    }

    //Handle Functions Below

    handleSubmit = () => {
        let updatedProductCategoriesArray = []
        this.state.selectedProductCategories.forEach(id => {
            if (!isNaN(id)) {
                updatedProductCategoriesArray.push({
                    "id": parseInt(id)
                })
            }
        })
        let updatedProductObject = {
            "name": this.state.name,
            "sku": this.state.sku,
            "status": this.state.status,
            "regular_price": this.state.regularPrice,
            "sale_price": this.state.salePrice,
            "date_on_sale_from": this.state.dateOnSaleFrom,
            "date_on_sale_to": this.state.dateOnSaleTo,
            "manage_stock": this.state.manageStock,
            "stock_quantity": this.state.stockQuantity,
            "stock_status": this.state.stockStatus,
            "weight": this.state.weight,
            "dimensions": { "length": this.state.length, "width": this.state.width, "height": this.state.height },
            "type": this.state.type,
            "virtual": this.state.virtual,
            "downloadable": this.state.downloadable,
            "categories": updatedProductCategoriesArray
        };
        console.log(updatedProductObject)

        // replacer = (key, value) => {
        //     if (key === 'stock_quantity' && value === null) {
        //         return undefined;
        //     }
        //     return value;
        // }

        const { base_url, c_key, c_secret } = this.state
        const url = `${base_url}/wp-json/wc/v3/products/${productId}?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProductObject),
        }).then((response) => response.json())
            .then((responseJson) => {
                if ("code" in responseJson) {
                    ToastAndroid.show(`Product Not Updated. Code: ${responseJson.code}`, ToastAndroid.LONG);
                    this.setState({
                        error: responseJson.code,
                        loading: false,
                    })
                } else {
                    ToastAndroid.show('Product Updated', ToastAndroid.LONG);
                    GLOBAL.productdetailsScreen.fetchProductDetails()
                    GLOBAL.productslistScreen.handleRefresh()
                    this.props.navigation.navigate('ProductDetails')
                }
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false,
                })
            });
    }
}

const styles = StyleSheet.create({
    section: {
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionCol: {
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10
    },
    labelInput: {

    },
    floatingInput: {
        borderWidth: 0,
        fontSize: 16
    },
    formInput: {
        borderBottomWidth: 1.5,
        borderColor: '#333'
    },
});