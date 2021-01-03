import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;
    const createCustomerService = container.resolve(CreateCustomerService);

    try {
      const customer = await createCustomerService.execute({ name, email });

      return response.status(200).json(customer);
    } catch (error) {
      return response.status(error.statusCode).json({ message: error.message });
    }
  }
}
