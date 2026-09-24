import { Response, NextFunction } from 'express';
import { addressService } from '../services/address.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AddressController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const addresses = await addressService.listUserAddresses(req.user!.userId);
      sendSuccess(res, 200, 'Addresses retrieved', { addresses });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await addressService.createAddress(req.user!.userId, req.body);
      sendSuccess(res, 201, 'Address added successfully', { address });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await addressService.updateAddress(req.user!.userId, req.params.id as string, req.body);
      sendSuccess(res, 200, 'Address updated successfully', { address });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await addressService.deleteAddress(req.user!.userId, req.params.id as string);
      sendSuccess(res, 200, 'Address deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async setDefault(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await addressService.setDefaultAddress(req.user!.userId, req.params.id as string);
      sendSuccess(res, 200, 'Default address updated');
    } catch (error) {
      next(error);
    }
  }
}

export const addressController = new AddressController();
