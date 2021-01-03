import { Request, Response } from 'express';

import { container } from 'tsyringe';
import CreateProductService from '@modules/products/services/CreateProductService';

export default class ProductsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, price, quantity } = request.body;
    const creatProductService = container.resolve(CreateProductService);

    try {
      const product = await creatProductService.execute({
        name,
        price,
        quantity,
      });

      return response.status(200).json(product);
    } catch (error) {
      return response.status(400).json({ message: error.message });
    }
  }
}
