import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError("Customer don't exists!");

    const productsByIds = await this.productsRepository.findAllById(products);

    if (!productsByIds.length)
      throw new AppError('Could not find any products with the given ids');

    const existenProductIds = productsByIds.map(product => product.id);

    const checkInexistenProducts = productsByIds.filter(
      product => !existenProductIds.includes(product.id),
    );

    if (checkInexistenProducts.length) {
      throw new AppError(
        `Could not find product ${checkInexistenProducts[0].id}`,
      );
    }

    const findProductWithQuantityAvailable = products.filter(product => {
      const productFound = productsByIds.find(value => value.id === product.id);

      return productFound && productFound.quantity < product.quantity;
    });

    if (findProductWithQuantityAvailable.length)
      throw new AppError('There are products with none available quantity!');

    const serializedProduct = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: productsByIds.filter(p => p.id === product.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer,
      products: serializedProduct,
    });

    const { order_products } = order;

    const orderedProductQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        productsByIds.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductQuantity);

    return order;
  }
}

export default CreateOrderService;
