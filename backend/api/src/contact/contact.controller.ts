import { Body, Controller, Post, SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../common/constants/auth.constants';

import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @SetMetadata(IS_PUBLIC_KEY, true)
  async submitContact(@Body() contactDto: ContactDto) {
    return await this.contactService.submitContact(contactDto);
  }
}
