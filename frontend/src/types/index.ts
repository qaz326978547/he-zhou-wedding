export interface RsvpPayload {
  name: string
  phone: string
  attending: boolean
  adultCount?: number | null
  childCount?: number | null
  needsHighchair?: boolean | null
  highchairCount?: number | null
  relationshipSide?: 'groom' | 'bride'
  relationshipType?: 'relative' | 'friend'
  dietaryPreference?: 'regular' | 'vegetarian'
  needsInvitation?: boolean
  invitationName?: string
  invitationPhone?: string
  invitationAddress?: string
}

export interface ApiResponse<T> {
  data: T
}

export interface RsvpStatus {
  enabled: boolean
}

export type DietaryPreference = NonNullable<RsvpPayload['dietaryPreference']>
export type RelationshipSide = NonNullable<RsvpPayload['relationshipSide']>
export type RelationshipType = NonNullable<RsvpPayload['relationshipType']>
