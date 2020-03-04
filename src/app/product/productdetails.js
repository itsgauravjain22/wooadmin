import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, Alert, ToastAndroid } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ActionButton from 'react-native-action-button';
import { Ionicons } from '@expo/vector-icons';
import GLOBAL from './productglobal'

const config = require('../../../config.json');

export default class ProductDetails extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('productName', 'Product'),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            base_url: null,
            c_key: null,
            c_secret: null,
            productData: {}
        };
        productId = this.props.navigation.getParam('productId');
        GLOBAL.productdetailsScreen = this;
        this._isMounted = false;
    }

    async componentDidMount() {
        this._isMounted = true;
        this._isMounted && await this.getCredentials();
        this._isMounted && this.fetchProductDetails()
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
            <View style={{ flex: 1 }}>
                {this.state.loading ? <ActivityIndicator size='large' color={config.colors.loadingColor} /> :
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }}>
                            {this.displayProductImages()}
                            {this.displayProductBasicDetails()}
                            {this.displayProductPricingDetails()}
                            {this.displayProductInventoryDetails()}
                            {this.displayProductShippingDetails()}
                            {this.displayProductCategoriesDetails()}
                            {this.displayProductAttributesDetails()}
                        </ScrollView>
                        {this.displayEditAndDeleteProductButton()}
                    </View>
                }
            </View>
        );
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

    //Fetch Function Below

    fetchProductDetails = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/products/${productId}?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    productData: responseJson,
                    error: responseJson.code || null,
                    loading: false
                });
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false
                })
            });
    }

    //Get Product Images
    getProductImages() {
        if ('images' in this.state.productData) {
            let productImagesData = [];
            this.state.productData.images.forEach(item => {
                if ('src' in item) {
                    productImagesData.push(
                        <Image
                            key={`image_${item.id}`}
                            source={{ uri: item.src }}
                            style={{ width: 150, height: 150 }}
                            resizeMode='contain'
                        />
                    )
                }
            });
            return <ScrollView horizontal={true}>{productImagesData}</ScrollView>
        }
        return <></>
    }

    //Get product categories data
    getProductCategories() {
        if ('categories' in this.state.productData) {
            let productCategoriesData = [];
            this.state.productData.categories.forEach(item => {
                productCategoriesData.push(
                    <View key={`category_${item.id}`} style={{
                        flexDirection: "row",
                        padding: 5,
                        margin: 5,
                        backgroundColor: 'white',
                        borderColor: 'black',
                        borderWidth: 0.25,
                        borderRadius: 10
                    }}>
                        <Text>{item.name ? item.name : null}</Text>
                    </View>
                )
            })
            return productCategoriesData;
        }
        else return []
    }

    //Get product attributes data
    getProductAttributes() {
        if ('attributes' in this.state.productData) {
            let productAttributesData = [];
            this.state.productData.attributes.forEach(item => {
                let attributesOptions = [];
                item.options.forEach((option, index) =>
                    attributesOptions.push(
                        <View key={`attribute_${item.id}_option${index}`} style={{
                            flexDirection: "row",
                            margin: 5,
                            padding: 5,
                            backgroundColor: 'white',
                            borderColor: 'black',
                            borderWidth: 0.25,
                            borderRadius: 10
                        }}>
                            <Text>{option}</Text>
                        </View>
                    )
                )
                productAttributesData.push(
                    <View key={`attribute_${item.id}`} style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                        <ScrollView horizontal={true}>
                            {attributesOptions}
                        </ScrollView>
                    </View>
                )
            }
            )
            return productAttributesData;
        }
        else return []
    }

    //Display Functions Below

    displayProductImages = () => {
        return (
            <View style={{ height: 150 }}>
                {this.getProductImages()}
            </View>
        )
    }

    displayProductBasicDetails = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>{this.state.productData.name}</Text>
                <Text>Sku: {this.state.productData.sku}</Text>
                <Text>Slug: {this.state.productData.slug}</Text>
                <Text>Status: {this.state.productData.status}</Text>
                <Text>Featured: {this.state.productData.featured ? 'Yes' : 'No'}</Text>
                <Text>Total Ordered: {this.state.productData.total_sales}</Text>
            </View>
        )
    }

    displayProductPricingDetails = () => {
        if (this.state.productData.regular_price || this.state.productData.sale_price) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Pricing</Text>
                    <Text>Regular Price: {this.state.productData.regular_price}</Text>
                    <Text>Sale Price: {this.state.productData.sale_price}</Text>
                </View>
            )
        }
    }

    displayProductInventoryDetails = () => {
        if (this.state.productData.stock_status || this.state.productData.manage_stock) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Inventory</Text>
                    <Text>Stock Status: {this.state.productData.stock_status}</Text>
                    <Text>Manage Stock: {this.state.productData.manage_stock ? 'Yes' : 'No'}</Text>
                    {this.state.productData.manage_stock
                        ? <Text>Stock Qty: {this.state.productData.stock_quantity}</Text>
                        : null
                    }
                </View>
            )
        }
    }

    displayProductShippingDetails = () => {
        if (this.state.productData.weight && 'dimensions' in this.state.productData ||
            this.state.productData.dimensions.length || this.state.productData.dimensions.width ||
            this.state.productData.dimensions.height) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Shipping</Text>
                    <Text>Weight: {this.state.productData.weight}</Text>
                    <Text>Size: {('dimensions' in this.state.productData) ? this.state.productData.dimensions.length : null}
                        {('dimensions' in this.state.productData)
                            ? (this.state.productData.dimensions.length) ?
                                `x${this.state.productData.dimensions.width}`
                                : null
                            : null}
                        {('dimensions' in this.state.productData)
                            ? (this.state.productData.dimensions.length)
                                ? `x${this.state.productData.dimensions.height}`
                                : null
                            : null}
                    </Text>
                </View>
            )
        }
    }

    displayProductCategoriesDetails = () => {
        if (Array.isArray(this.getProductCategories()) && this.getProductCategories().length) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Categories</Text>
                    <ScrollView horizontal={true}>{this.getProductCategories()}</ScrollView>
                </View>
            )
        }
    }

    displayProductAttributesDetails = () => {
        if (Array.isArray(this.getProductAttributes()) && this.getProductAttributes().length) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Attributes</Text>
                    <>{this.getProductAttributes()}</>
                </View>
            )
        }
    }

    displayEditAndDeleteProductButton = () => {
        if (config.permissions.products.edit || config.permissions.products.delete) {
            return (
                <ActionButton
                    buttonColor={config.colors.btnColor}
                    hideShadow={true}
                >
                    {config.permissions.products.edit
                        ? <ActionButton.Item
                            buttonColor={config.colors.btnColor}
                            title="Edit"
                            size={35}
                            textContainerStyle={{ height: 27 }}
                            textStyle={{ fontSize: 16 }}
                            spaceBetween={8}
                            onPress={() => {
                                this.props.navigation.navigate('EditProduct', {
                                    productId: productId,
                                    productName: this.state.productData.name,
                                })
                            }}
                        >
                            <Ionicons name="md-create" size={20} color={config.colors.btnTextColor} />
                        </ActionButton.Item>
                        : null}
                    {config.permissions.products.delete
                        ? <ActionButton.Item
                            buttonColor='red'
                            title="Delete"
                            size={35}
                            textContainerStyle={{ height: 27 }}
                            textStyle={{ fontSize: 16 }}
                            spaceBetween={8}
                            onPress={() => {
                                Alert.alert(
                                    'Delete Product',
                                    'Do you really want to delete this product?',
                                    [
                                        {
                                            text: 'No'
                                        },
                                        {
                                            text: 'Yes',
                                            onPress: this.deleteProduct
                                        },
                                    ],
                                    { cancelable: true },
                                );
                            }}
                        >
                            <Ionicons name="md-trash" size={20} color={config.colors.btnTextColor} />
                        </ActionButton.Item>
                        : null}
                </ActionButton>
            )
        } else return null
    }

    // Delete a product
    deleteProduct = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/products/${productId}?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url, {
            method: 'DELETE'
        }).then((response) => response.json())
            .then((responseJson) => {
                if ('id' in responseJson) {
                    ToastAndroid.show('Product Deleted', ToastAndroid.LONG);
                    GLOBAL.productslistScreen.handleRefresh()
                    this.props.navigation.navigate('ProductsList')
                } else if ('code' in responseJson) {
                    this.setState({
                        error: responseJson.code || null,
                        loading: false
                    });
                    ToastAndroid.show(`Product Not Deleted. Error Code: ${responseJson.code}`, ToastAndroid.LONG);
                }
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false
                })
                ToastAndroid.show(`Product Not Deleted. Error: ${responseJson.code}`, ToastAndroid.LONG);
            });
    }

}

const styles = StyleSheet.create({
    section: {
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
