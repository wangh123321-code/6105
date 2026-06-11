import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { MatchService } from './match.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreditGuard } from '../common/guards/credit.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateMatchRequestDto } from './dto/create-match-request.dto';
import { Body } from '@nestjs/common';

@Controller('match')
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('requests')
  @UseGuards(CreditGuard)
  createRequest(@CurrentUser('id') userId: number, @Body() dto: CreateMatchRequestDto) {
    return this.matchService.create(userId, dto);
  }

  @Get('requests/:id/recommendations')
  findRecommendations(@CurrentUser('id') userId: number, @Param('id') matchRequestId: number) {
    return this.matchService.findRecommendations(userId, matchRequestId);
  }

  @Post('requests/:id/confirm')
  @UseGuards(CreditGuard)
  confirmMatch(@CurrentUser('id') userId: number, @Param('id') matchRequestId: number) {
    return this.matchService.confirmMatch(userId, matchRequestId);
  }

  @Get('requests/mine')
  findMyRequests(@CurrentUser('id') userId: number) {
    return this.matchService.findMyRequests(userId);
  }
}
