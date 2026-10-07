import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseCsvPipe implements PipeTransform<string, string[]> {
  transform(value: string): string[] {
    const list = value
      .split(',')        // "A, B,C\n" -> ["A", " B", "C\n"]
      .map((s) => s.trim()) // remove spaces and the trailing newline
      .filter(Boolean);  // drop empty entries like "A,,B"

    if (!list.length) {
      throw new BadRequestException('At least one SKU is required');
    }
    return list;
  }
}