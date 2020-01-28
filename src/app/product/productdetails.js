import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GLOBAL from './productglobal'

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
            productData: {}
        };
        productId = this.props.navigation.getParam('productId');
        base_url = this.props.navigation.getParam('base_url');
        c_key = this.props.navigation.getParam('c_key');
        c_secret = this.props.navigation.getParam('c_secret');
        GLOBAL.productdetailsScreen = this;
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.fetchProductDetails()
        });
    }

    fetchProductDetails = () => {
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
        return <></>
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
        return <></>
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                    <ActivityIndicator color='#96588a' size='large' />
                </View>
            )
        }

        return (
            <View style={{ flex: 1 }}>
                {this.state.loading ? <ActivityIndicator size='large' color='#96588a' /> :
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ height: 150 }}>
                            {this.getProductImages()}
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.titleText}>{this.state.productData.name}</Text>
                            <Text>Sku: {this.state.productData.sku}</Text>
                            <Text>Slug: {this.state.productData.slug}</Text>
                            <Text>Status: {this.state.productData.status}</Text>
                            <Text>Total Ordered: {this.state.productData.total_sales}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.titleText}>Pricing</Text>
                            <Text>Regular Price: {this.state.productData.regular_price}</Text>
                            <Text>Sale Price: {this.state.productData.sale_price}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.titleText}>Inventory</Text>
                            <Text>Stock Status: {this.state.productData.stock_status}</Text>
                            <Text>Manage Stock: {this.state.productData.manage_stock ? 'true' : 'false'}</Text>
                            <Text>Stock Qty: {this.state.productData.stock_quantity}</Text>
                        </View>
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
                        <View style={styles.section}>
                            <Text style={styles.titleText}>Categories</Text>
                            <ScrollView horizontal={true}>{this.getProductCategories()}</ScrollView>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.titleText}>Attributes</Text>
                            <>{this.getProductAttributes()}</>
                        </View>
                    </ScrollView>
                }
                <TouchableOpacity
                    style={{
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.2)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        position: 'absolute',
                        bottom: 15,
                        right: 15,
                        backgroundColor: '#fff',
                        borderRadius: 100,
                    }}
                    onPress={() => {
                        this.props.navigation.navigate('EditProduct', {
                            productId: productId,
                            productName: this.props.navigation.productName,
                            productData: this.state.productData,
                            base_url: base_url,
                            c_key: c_key,
                            c_secret: c_secret
                        });
                    }}
                >
                    <Ionicons name="md-create" size={30} color="#96588a" />
                </TouchableOpacity>
            </View>
        );
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
